import tensorflow as tf

class Model(object):
    def __init__(self, multiplier):
        self.x = tf.placeholder(tf.float32)
        self.factor = tf.constant(multiplier, dtype=tf.float32)
        self.result = tf.multiply(self.x, self.factor)
        self.sess = tf.Session()

    def calculate(self, x):
        result = self.sess.run(self.result, feed_dict={self.x: x})
        return result

