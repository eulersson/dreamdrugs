import PIL
import numpy as np


def load_image(filename):
    """
    Initializes a numpy array from the image path.

    Arguments:
        filename (str): Path-like to load from.

    Returns:
        np.array of float: Image data.
    """
    image = PIL.Image.open(filename)
    image = image.convert('RGB')
    image_array = np.float32(image)
    return image_array


def image_from_array(img_arr):
    """
    Constructs a pillow image from a numpy array.

    Arguments:
        img_arr (np.array): Image data as an array.

    Returns:
        PIL.Image: Initialized pillow image.
    """
    img_arr = np.clip(img_arr, 0, 255)
    img_arr = np.uint8(img_arr)
    img = PIL.Image.fromarray(img_arr)
    return img


def resize_image(image, size=None, factor=None):
    """
    For scaling images. A fixed size can be passed or simply a factor which gets
    multiplied by both dimensions. If both factor and size are passed they
    accumulate, that is, the passed size multiplied by the factor will be used.

    Arguments:
        image (np.array): Image data.
        size (tuple of int): Desired size specified as (width, height).
        factor (float): Factor to multiply a size tuple against.

    Returns:
        np.array of float: Scaled result.
    """
    img = image_from_array(image)
    final_size = img.size

    if size:
        final_size = size
    if factor:
        final_size = tuple(map(lambda x: int(x * factor), final_size))

    img = img.resize(final_size, PIL.Image.LANCZOS)
    img_arr = np.float32(img)
    return img_arr
