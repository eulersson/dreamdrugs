import threading
import time


class ProgressThread(threading.Thread):
    """In charge of reporting the model's progress attribute.

    When running an image through the model, we spawn one of those threads that
    will be monitoring the progress member of the model we initialize it with.

    Args:
        model (dreambox.Model): Model implementation in this project.
        sleep (float, optional): In seconds, every how often the checks happen.
    """

    def __init__(self, model, sleep=0.5):
        super(ProgressThread, self).__init__()
        self.progress = 0
        self.model = model
        self.sleep = sleep

    def reset_progress(self):
        """Set the progress back to zero."""

        self.progress = 0

    def run(self):
        """Until the model has not finished keep updating the progress."""

        while self.progress != 100:
            self.progress = self.model.progress
            time.sleep(self.sleep)

