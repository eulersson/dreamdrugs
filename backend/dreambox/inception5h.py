import datetime
import math
import os
import random
import sys
import urllib
import zipfile

import PIL
import numpy as np
import tensorflow as tf

from scipy.ndimage.filters import gaussian_filter

from dreambox import Model
from dreambox.utils import load_image, image_from_array, resize_image

import logging
log = logging.getLogger('dreambox')

# Where to download the model from.
model_url = 'http://storage.googleapis.com/download.tensorflow.org/models/inception5h.zip'
base_name = model_url.split('/')[-1]

# Where to extract it within the application.
model_subfolder = os.path.join('downloads', 'inception5h')
target_zip_path = os.path.join(model_subfolder, base_name)
unzip_to_folder = os.path.join(model_subfolder, 'extracted')
protobuff_path = os.path.join(unzip_to_folder, 'tensorflow_inception_graph.pb')

# Input node of the graph definition we downloaded.
input_tensor_name = "input:0"


class Inception5hModel(Model):
    """
    Wraps the logic of Google's Inception5h dreaming model into a class.

    Attributes:
        graph (tf.Graph): Graph to store all the nodes.
        session (tf.Session): Active session throughout the algorithm.
    """

    def __init__(self):
        # Call the superclass method that initializes job id.
        super(Inception5hModel, self).__init__()

        # Downloads the model if not existing.
        if not os.path.exists(model_subfolder):
            os.makedirs(model_subfolder)

        # Uncompression.
        if not os.path.exists(unzip_to_folder):
            if not os.path.exists(target_zip_path):
                # Report download progress. Args: count, block_size, total_size.
                hook = lambda c, b_s, t_s: log.debug(
                    "Progress: {:.1%}".format(float(c * b_s) / t_s)
                )
                file_path, _ = urllib.request.urlretrieve(model_url, target_zip_path, hook)
            else:
                file_path = target_zip_path

            zipfile.ZipFile(file_path).extractall(unzip_to_folder)

        # Create graph and session to interact with.
        self.graph = tf.Graph()
        self.sess = tf.Session(graph=self.graph)

        # Parse in the inception graph into a graph definition object.
        with tf.gfile.FastGFile(protobuff_path, 'rb') as f:
            graph_def = tf.GraphDef()
            graph_def.ParseFromString(f.read())

        # Load up the parsed definition into our current graph.
        with self.graph.as_default():
            # We will feed 3-dimensional image data to this tensor in our feed
            # dicts. However as the trained network understands an array of 
            # images as input, we expand the dimensions.
            self.input_image_tensor = tf.placeholder(tf.float32, name='input')
            input_tensor = tf.expand_dims(self.input_image_tensor, 0)
            tf.import_graph_def(graph_def, {'input': input_tensor})

    def optimize_image(
        self,
        image,
        gradient,
        current_octave,
        num_octaves,
        num_iterations,
        step_size
    ):
        """
        Runs one iteration on the image pixels where it runs the gradients,
        scales them, and adds them to the input image pixels.

        It also updates the percentage and publishes it to redis so it can be
        fetched from the frontend. They key used is the jobId.

        Args:
            image (np.array of float): Input image to dream on.
            gradient (tf.Tensor): Tensor that computes the gradients.
            current_octave (int): What octave are we in. For progress update.
            num_octaves (int): Total number of octaves. For progress update.
            num_iterations (int): How many times to run gradients and add them.
            step_size (float): A factor to multiply the gradient against.

        Returns:
            np.array of float: Image array with gradients summed to it.
        """
        img = image.copy()

        for it in range(num_iterations):
            # Prepare feed dict, run gradients and normalize the result.
            feed_dict = { self.input_image_tensor: img }
            g = self.sess.run(gradient, feed_dict=feed_dict)
            g /= (np.std(g) + 1e-8)

            # Blur the result.
            sigma = (it * 4.0) / num_iterations + 0.5
            grad_smooth1 = gaussian_filter(g, sigma=sigma)
            grad_smooth2 = gaussian_filter(g, sigma=sigma*2)
            grad_smooth3 = gaussian_filter(g, sigma=sigma*0.5)
            g = (grad_smooth1 + grad_smooth2 + grad_smooth3)

            # Add the scaled gradients to the image.
            step_size_scaled = step_size / (np.std(g) + 1e-8)
            img += step_size_scaled * g

            # Update the progress based on the iteration and octave we are in.
            total_num_iters = num_octaves * num_iterations
            octaves_completed = current_octave - 1
            iters_completed = octaves_completed * num_iterations + it + 1
            percentage = iters_completed / float(total_num_iters) * 100.0
            self.update_progress(percentage)

            log.debug("%d%% | Octave %d/%d | Iteration %d/%d" % (
                percentage, current_octave, num_octaves, it, num_iterations
            ))

        return img

    def recursive_optimize(
        self,
        image,
        gradient,
        blend,
        depth_level,
        total_depth,
        num_iterations,
        rescale_factor,
        step_size
    ):
        """Runs the optimization stepping (adding gradients to the image) at
        various scales, or octaves.

        Args:
            image (np.array of float): Input image to dream on.
            gradient (tf.Tensor): Tensor that computes the gradients.
            blend (float): How much of the previous image (higher octave, larger
                resolution) to preserve. 1.0 will not preserve any effect from
                the higher octave and 0.0 otherwise.
            depth_level (int): Number of octaves to recursively dream on.
            total_depth (int): Total number of octaves.
            num_iterations (int): How many times to run gradients and add them.
            rescale_factor (float): What ratio to scale the image in the
                subsequent octaves. E.g. 0.7 will make it 70% of the higher
                octave size.
            step_size (float): A factor to multiply the gradient against.
        """
        if depth_level > 1:
            sigma = 0.5
            img_blur = gaussian_filter(image, sigma=(sigma, sigma, 0.0))
            img_downscaled = resize_image(img_blur, factor=rescale_factor)
            img_result = self.recursive_optimize(
                img_downscaled,
                gradient,
                blend=blend,
                depth_level=depth_level-1,
                total_depth=total_depth,
                num_iterations=num_iterations,
                rescale_factor=rescale_factor,
                step_size=step_size
            )
            img_upscaled = resize_image(img_result, size=(image.shape[1],image.shape[0]))
            image = blend * image + (1 - blend) * img_upscaled

        img_result = self.optimize_image(
            image,
            gradient,
            depth_level,
            total_depth,
            num_iterations=num_iterations,
            step_size=step_size
        )

        return img_result

    def run(
        self,
        impath,
        blend=0.2,
        depth_level=3,
        feature_channel=None,
        layer_name='mixed4a',
        num_iterations=10,
        rescale_factor=0.7,
        squared=True,
        step_size=1.5
    ):
        """Entry point to the algorithm. This is the method to be run from the
        endpoint or blueprint. Feed in an image (from a path), and it will dream
        on it and generate a resulting one and return it's path.

        Args:
            impath (str): Path-like. Input image path.
            blend (float, optional): How much of the previous image (higher
                octave, larger resolution) to preserve. 1.0 will not preserve
                any effect from the higher octave and 0.0 otherwise.
            depth_level (int): Number of octaves to recursively dream on.
            feature_channel (int): Isolates just one feature channel on the
                layer tensor. That is, the right-most dimension is fixed.
            layer_name (str): blablabla
            num_iterations (int): How many times to run gradients and add them.
            rescale_factor (float): What ratio to scale the image in the
                subsequent octaves. E.g. 0.7 will make it 70% of the higher
                octave size.
            squared (bool): Squares the layer tensor before computing its
                gradients. What this will do is change the sign of the negative
                gradients thus achieving different results on the final image.
            step_size (float): A factor to multiply the gradient against.

        Returns:
            str: Path-like of the resulting image. Carries job id in its name.
        """
        # Sanitize arguments as might come from frontend as strings.
        #blend = float(blend)
        #depth_level = int(depth_level)

        image = load_image(impath)

        with self.graph.as_default():
            layer_tensor = self.graph.get_tensor_by_name('import/%s:0' % layer_name)

            if squared:
                layer_tensor = tf.square(layer_tensor)

            if feature_channel is not None:
                layer_tensor = layer_tensor[..., feature_channel]

            # Define the gradients of the objective with respect to the image.
            objective = tf.reduce_mean(layer_tensor)
            gradient = tf.gradients(objective, self.input_image_tensor)[0]

        result = self.recursive_optimize(
            image,
            gradient,
            depth_level=depth_level,
            total_depth=depth_level,
            rescale_factor=rescale_factor,
            blend=blend,
            num_iterations=num_iterations,
            step_size=step_size
        )

        #out_path = '/uploads/%s.jpg' % (datetime.datetime.now().strftime('%Y%m%d%H%M%S'))
        out_path = '/uploads/%s.jpg' % self.job_id
        image_from_array(result).save(out_path)

        #return out_path
