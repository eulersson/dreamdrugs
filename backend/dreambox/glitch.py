from datetime import datetime
from functools import reduce

import numpy as np
import tensorflow as tf
from PIL import Image

import logging
log = logging.getLogger('dreambox.tf')


class GlitchModel(object):
    imshape = (640, 480, 3)
    imsize_flat = reduce(lambda x, y: x * y, imshape)

    def initialize(self, impath):
        log.info("Trying to load {}".format(impath))

        in_img = Image.open(impath)
        in_img = in_img.resize(self.imshape[0:2])

        self.img_data = np.array(in_img)

        # Drop the alpha channel as we do not want it.
        self.img_data = self.img_data[...,:3]

        # numpy-style is column-major, Pillow is row-major
        self.img_data = np.transpose(self.img_data, (1, 0, 2))

        self.img_data = np.reshape(self.img_data, self.imsize_flat)

        # All the calculations happen using float32, in the end we give uint8.
        self.x = tf.placeholder(tf.float32, shape=self.imsize_flat)

        factor_array = np.arange(1, 0, -1.0 / float(self.imsize_flat))
        factor = tf.constant(factor_array, dtype=tf.float32)

        self.result = tf.multiply(self.x, factor)
        self.result = tf.cast(self.result, tf.uint8)

        self.sess = tf.Session()

    def run(self, impath):
        out_img_flat = self.sess.run(self.result, feed_dict={self.x: self.img_data})
        out_img_data = np.reshape(out_img_flat, self.imshape)

        out_img_data = np.transpose(out_img_data, (1, 0, 2)) # numpy-style is column-major, Pillow is row-major
        out_path = '/uploads/%s.jpg' % (datetime.now().strftime('%Y%m%d%H%M%S'))
        out_img = Image.fromarray(out_img_data)
        print("out_image", out_img.size)

        log.warn("Saving out %s" % out_path)
        out_img.save(out_path)

        return out_path
