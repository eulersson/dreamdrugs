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

from dreambox.utils import load_image, image_from_array, resize_image

import logging
log = logging.getLogger('dreambox.tf')

model_url = 'http://storage.googleapis.com/download.tensorflow.org/models/inception5h.zip'
base_name = model_url.split('/')[-1]

model_subfolder = 'inception5h'
target_zip_path = os.path.join(model_subfolder, base_name)
unzip_to_folder = os.path.join(model_subfolder, 'extracted')
protobuff_path = os.path.join(unzip_to_folder, 'tensorflow_inception_graph.pb')

input_tensor_name = "input:0"


class Inception5hModel:
    def __init__(self):
        self.progress = 0
        def hook(count, block_size, total_size):
            percentage = float(count * block_size) / total_size
            log.info("Download progress: {:.1%}".format(percentage))
            #sys.stdout.write("\r Download progress: {:.1%}".format(percentage))
            #sys.stdout.flush()

        if not os.path.exists(model_subfolder):
            os.makedirs(model_subfolder)

        if not os.path.exists(unzip_to_folder):
            if not os.path.exists(target_zip_path):
                file_path, _ = urllib.request.urlretrieve(model_url, target_zip_path, hook)
            else:
                file_path = target_zip_path

            zipfile.ZipFile(file_path).extractall(unzip_to_folder)

        self.graph = tf.Graph()
        self.sess = tf.Session(graph=self.graph)

        with tf.gfile.FastGFile(protobuff_path, 'rb') as f:
            graph_def = tf.GraphDef()
            graph_def.ParseFromString(f.read())

        with self.graph.as_default():
            self.input_image_tensor = tf.placeholder(tf.float32, name='input')
            input_tensor = tf.expand_dims(self.input_image_tensor, 0)
            tf.import_graph_def(graph_def, {'input': input_tensor})

    def optimize_image(
        self,
        layer_tensor,
        image,
        gradient,
        current_octave,
        num_octaves,
        num_iterations=10,
        step_size=3.0
    ):
        img = image.copy()

        log.info("Processing image.")
        for it in range(num_iterations):
            feed_dict = { self.input_image_tensor: img }
            g = self.sess.run(gradient, feed_dict=feed_dict)
            g /= (np.std(g) + 1e-8)

            sigma = (it * 4.0) / num_iterations + 0.5
            grad_smooth1 = gaussian_filter(g, sigma=sigma)
            grad_smooth2 = gaussian_filter(g, sigma=sigma*2)
            grad_smooth3 = gaussian_filter(g, sigma=sigma*0.5)
            g = (grad_smooth1 + grad_smooth2 + grad_smooth3)

            step_size_scaled = step_size / (np.std(g) + 1e-8)

            img += step_size_scaled * g

            total_num_iters = num_octaves * num_iterations
            octaves_completed = current_octave - 1
            iters_completed = octaves_completed * num_iterations + it + 1
            percentage = iters_completed / float(total_num_iters) * 100.0
            self.progress = percentage

        print("Done!")

        return img

    def recursive_optimize(
        self,
        layer_tensor,
        image,
        gradient,
        blend=0.2,
        depth_level=4,
        total_depth=4,
        feature_channel=None,
        num_iterations=10,
        rescale_factor=0.7,
        step_size=3.0
    ):
        if depth_level > 1:
            sigma = 0.5
            img_blur = gaussian_filter(image, sigma=(sigma, sigma, 0.0))
            img_downscaled = resize_image(img_blur, factor=rescale_factor)
            img_result = self.recursive_optimize(
                layer_tensor,
                img_downscaled,
                gradient,
                blend=blend,
                depth_level=depth_level-1,
                total_depth=total_depth,
                feature_channel=feature_channel,
                num_iterations=num_iterations,
                rescale_factor=rescale_factor,
                step_size=step_size
            )
            img_upscaled = resize_image(img_result, size=(image.shape[1],image.shape[0]))
            image = blend * image + (1 - blend) * img_upscaled

        print("Depth level:", depth_level)
        img_result = self.optimize_image(
            layer_tensor,
            image,
            gradient,
            depth_level,
            total_depth,
            num_iterations=num_iterations,
            step_size=step_size
        )
        return img_result

    def reset_progress(self):
        self.progress = 0

    def run(
        self,
        impath,
        blend=0.2,
        depth_level=3,
        feature_channel=None,
        layer_name='mixed4a',
        num_iterations=5,
        rescale_factor=0.7,
        squared=True,
        step_size=1.5
    ):
        image = load_image(impath)
        with self.graph.as_default():
            layer_tensor = self.graph.get_tensor_by_name('import/%s:0' % layer_name)

            if squared:
                layer_tensor = tf.square(layer_tensor)

            if feature_channel is not None:
                layer_tensor = layer_tensor[..., feature_channel]

            objective = tf.reduce_mean(layer_tensor)
            gradient = tf.gradients(objective, self.input_image_tensor)[0]
        print(feature_channel)

        result = self.recursive_optimize(
            layer_tensor,
            image,
            gradient,
            feature_channel=feature_channel,
            depth_level=depth_level,
            total_depth=depth_level,
            rescale_factor=rescale_factor,
            blend=blend,
            num_iterations=num_iterations,
            step_size=step_size
        )

        out_path = '/uploads/%s.jpg' % (datetime.datetime.now().strftime('%Y%m%d%H%M%S'))
        image_from_array(result).save(out_path)

        return out_path
