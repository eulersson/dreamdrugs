import logging


def setup_logging(level):
    """
    Setup dreamdrugs logger with a stream and file handler.

    To get the logger later on simply::

        import logging
        log = logging.getLogger('dreamdrugs')

    Arguments:
        level (int): Logging level to set.

    Returns:
        logging.Logger: An initialized logger.
    """
    log = logging.getLogger('dreamdrugs')
    log.setLevel(logging.DEBUG)

    fmt = logging.Formatter(
        '%(asctime)s [%(name)s] %(levelname)s - '
        '%(module)s.%(funcName)s:%(lineno)s %(message)s'
    )

    ch = logging.StreamHandler()
    ch.setFormatter(fmt)

    fh = logging.FileHandler('backend.log')
    fh.setFormatter(fmt)

    log.addHandler(ch)
    log.addHandler(fh)

    return log
