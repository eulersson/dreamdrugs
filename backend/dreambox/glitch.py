import numpy as np
import tensorflow as tf
from PIL import Image


class GlitchModel(object):
    img_size = 700
    channels = 3
    img_size_flat = img_size * img_size * channels
    img_size_shape = (img_size, img_size, channels)

    def __init__(self):
        self.x = tf.placeholder(tf.float32, shape=self.img_size_flat)
        factor_array = np.arange(1, 0, -1 / float(self.img_size_flat))
        factor = tf.constant(factor_array, dtype=tf.float32)
        self.result = tf.multiply(self.x, factor)
        self.sess = tf.Session()

    def run(self, impath):
        print("Trying to load {}".format(impath))
        in_img = Image.open(impath)
        in_img.load()
        in_img_data = np.asarray(in_img)
        in_img_flat = np.reshape(in_img_data, self.img_size_flat)

        out_img_flat = self.sess.run(self.result, feed_dict={self.x: in_img_flat})
        out_img_data = np.reshape(out_img_flat, self.img_size_shape)

        out_path = '/uploads/deep_me.jpg'
        out_img = Image.fromarray(out_img_data, 'RGB')
        out_img.save(out_path)

        return out_path
