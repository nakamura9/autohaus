import boto3
import logging
from datetime import datetime
import watchtower
import os


class CloudWatchLogger:
    def __init__(self, log_group_name, log_stream_name=None, region=None):
        """
        Initialize CloudWatch logger

        Args:
            log_group_name (str): Name of the CloudWatch log group
            log_stream_name (str): Name of the log stream (defaults to datetime)
            region (str): AWS region for CloudWatch
        """
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)

        # Clear any existing handlers
        self.logger.handlers = []

        # Create log stream name if not provided
        if not log_stream_name:
            log_stream_name = datetime.now().strftime('%Y/%m/%d/%H/%M/%S')

        # Create CloudWatch handler
        try:
            cloudwatch_handler = watchtower.CloudWatchLogHandler(
                log_group_name=log_group_name,
                stream_name=log_stream_name,
                boto3_client=boto3.client('logs')
            )

            # Set log format
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            cloudwatch_handler.setFormatter(formatter)

            # Add handler to logger
            self.logger.addHandler(cloudwatch_handler)

            # Optionally add console handler for local debugging
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)

        except Exception as e:
            print(f"Error setting up CloudWatch logging: {str(e)}")
            raise

    def info(self, message):
        """Log info level message"""
        self.logger.info(message)

    def error(self, message):
        """Log error level message"""
        self.logger.error(message)

    def warning(self, message):
        """Log warning level message"""
        self.logger.warning(message)

    def debug(self, message):
        """Log debug level message"""
        self.logger.debug(message)

    def critical(self, message):
        """Log critical level message"""
        self.logger.critical(message)


logger = CloudWatchLogger(
    log_group_name='Autohaus',
    log_stream_name='app-logs',
    region='af-south-1'
)