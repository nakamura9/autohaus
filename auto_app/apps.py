from django.apps import AppConfig


class AutoAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'auto_app'

    def ready(self):
        from . import signals
        
        
