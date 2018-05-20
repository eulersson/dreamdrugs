import threading
import time


class ProgressThread(threading.Thread):
    def __init__(self, model, sleep=0.5):
        super(ProgressThread, self).__init__()
        self.progress = 0
        self.model = model
        self.sleep = sleep

    def reset_progress(self):
        self.progress = 0

    def run(self):
        while self.progress != 100:
            self.progress = self.model.progress
            time.sleep(self.sleep)

