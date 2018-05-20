import PIL
import numpy as np


def load_image(filename):
    image = PIL.Image.open(filename)
    image = image.convert('RGB')
    image_array = np.float32(image)
    return image_array

def image_from_array(img_arr):
    img_arr = np.clip(img_arr, 0, 255)
    img_arr  = np.uint8(img_arr)
    img_arr = PIL.Image.fromarray(img_arr)
    return img_arr

def resize_image(image, size=None, factor=None):
    img = image_from_array(image)
    final_size = img.size

    if size:
        final_size = size
    if factor:
        final_size = tuple(map(lambda x: int(x * factor), final_size))

    img = img.resize(final_size, PIL.Image.LANCZOS)
    img_arr = np.float32(img)
    return img_arr
