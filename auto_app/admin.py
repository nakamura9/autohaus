from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Count
from django.urls import reverse
from .models import (
    Vehicle, VehiclePhoto, Make, Model, Seller,
    Currency, City, FAQ, FAQCategory, ContactEntry,
    SavedListing, SavedSearch
)


# Inline admins for related models
class VehiclePhotoInline(admin.TabularInline):
    model = VehiclePhoto
    extra = 1
    fields = ('photo', 'thumbnail_preview', 'is_main', 'created_at')
    readonly_fields = ('thumbnail_preview', 'created_at')

    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" style="max-height: 50px;"/>', obj.thumbnail.url)
        elif obj.photo:
            return format_html('<img src="{}" style="max-height: 50px;"/>', obj.photo.url)
        return "No image"
    thumbnail_preview.short_description = "Preview"


class ModelInline(admin.TabularInline):
    model = Model
    extra = 0
    fields = ('name', 'year', 'transmission', 'fuel_type', 'number_of_vehicles')
    readonly_fields = ('number_of_vehicles',)
    show_change_link = True


# Main model admins
@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'vehicle_info', 'seller_link', 
        'year', 'mileage', 'condition', 'city', 'published',
        'photo_count', 'created_at'
    )
    list_filter = (
        'published', 'temporary', 'negotiable', 'condition',
        'transmission', 'fuel_type', 'drivetrain', 'body_type',
        ('make', admin.RelatedOnlyFieldListFilter),
        ('city', admin.RelatedOnlyFieldListFilter),
        ('created_at', admin.DateFieldListFilter),
    )
    search_fields = (
        'model__name', 'make__name', 'seller__name',
        'chassis_number', 'model_number', 'description'
    )
    list_editable = ('published',)
    list_per_page = 25
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Vehicle Information', {
            'fields': (
                ('make', 'model'),
                ('year', 'body_type'),
                ('engine', 'transmission'),
                ('fuel_type', 'drivetrain'),
                ('condition', 'mileage'),
            )
        }),
        ('Pricing & Location', {
            'fields': (
                ('price', 'currency', 'negotiable'),
                ('city',),
            )
        }),
        ('Seller Information', {
            'fields': ('seller',)
        }),
        ('Additional Details', {
            'fields': (
                'description',
                ('chassis_number', 'model_number'),
            )
        }),
        ('Publication', {
            'fields': (
                ('published', 'published_date'),
                'temporary',
            )
        }),
        ('System Information', {
            'classes': ('collapse',),
            'fields': (
                ('created_at', 'updated_at'),
                ('created_by', 'updated_by'),
            )
        }),
    )

    readonly_fields = ('created_at', 'updated_at')
    inlines = [VehiclePhotoInline]

    autocomplete_fields = ['make', 'model', 'seller', 'city']

    actions = ['publish_vehicles', 'unpublish_vehicles', 'mark_as_negotiable']

    def vehicle_info(self, obj):
        return format_html(
            '<strong>{} {}</strong><br/><small>{}</small>',
            obj.make.name,
            obj.model.name,
            obj.engine
        )
    vehicle_info.short_description = "Vehicle"

    def seller_link(self, obj):
        url = reverse("admin:auto_app_seller_change", args=[obj.seller.id])
        return format_html('<a href="{}">{}</a>', url, obj.seller.name)
    seller_link.short_description = "Seller"


    def published_status(self, obj):
        if obj.published:
            color = "green"
            text = "✓ Published"
        else:
            color = "red"
            text = "✗ Unpublished"
        return format_html(
            '<span style="color: {};">{}</span>',
            color, text
        )
    published_status.short_description = "Status"
    published_status.admin_order_field = 'published'

    def photo_count(self, obj):
        count = obj.photos.count()
        if count == 0:
            return format_html('<span style="color: red;">0</span>')
        return format_html('<span style="color: green;">{}</span>', count)
    photo_count.short_description = "Photos"

    def publish_vehicles(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(published=True, published_date=timezone.now().date())
        self.message_user(request, f"{updated} vehicle(s) published successfully.")
    publish_vehicles.short_description = "Publish selected vehicles"

    def unpublish_vehicles(self, request, queryset):
        updated = queryset.update(published=False)
        self.message_user(request, f"{updated} vehicle(s) unpublished.")
    unpublish_vehicles.short_description = "Unpublish selected vehicles"

    def mark_as_negotiable(self, request, queryset):
        updated = queryset.update(negotiable=True)
        self.message_user(request, f"{updated} vehicle(s) marked as negotiable.")
    mark_as_negotiable.short_description = "Mark as negotiable"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('make', 'model', 'seller', 'city', 'currency')


@admin.register(VehiclePhoto)
class VehiclePhotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'vehicle_link', 'photo_preview', 'thumbnail_preview', 'is_main', 'has_cdn', 'created_at')
    list_filter = (
        'is_main',
        ('vehicle__make', admin.RelatedOnlyFieldListFilter),
        ('created_at', admin.DateFieldListFilter),
    )
    search_fields = ('vehicle__model__name', 'vehicle__make__name')
    list_per_page = 50

    fields = (
        'vehicle', 'photo', 'photo_preview',
        'thumbnail', 'thumbnail_preview',
        'is_main', 'cdn_photo', 'cdn_thumbnail',
        'created_at', 'updated_at'
    )
    readonly_fields = ('photo_preview', 'thumbnail_preview', 'created_at', 'updated_at')

    autocomplete_fields = ['vehicle']

    def vehicle_link(self, obj):
        url = reverse("admin:auto_app_vehicle_change", args=[obj.vehicle.id])
        return format_html('<a href="{}">{}</a>', url, obj.vehicle)
    vehicle_link.short_description = "Vehicle"

    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="max-height: 100px;"/>', obj.photo.url)
        return "No photo"
    photo_preview.short_description = "Photo"

    def thumbnail_preview(self, obj):
        if obj.thumbnail:
            return format_html('<img src="{}" style="max-height: 100px;"/>', obj.thumbnail.url)
        return "No thumbnail"
    thumbnail_preview.short_description = "Thumbnail"

    def has_cdn(self, obj):
        if obj.cdn_photo and obj.cdn_thumbnail:
            return format_html('<span style="color: green;">✓</span>')
        return format_html('<span style="color: red;">✗</span>')
    has_cdn.short_description = "CDN"


@admin.register(Make)
class MakeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'logo_preview', 'number_of_vehicles', 'number_of_models', 'created_at')
    search_fields = ('name',)
    list_per_page = 50

    fields = (
        'name', 'logo', 'logo_preview',
        'number_of_vehicles', 'number_of_models',
        'created_at', 'updated_at', 'created_by', 'updated_by'
    )
    readonly_fields = ('logo_preview', 'number_of_vehicles', 'number_of_models', 'created_at', 'updated_at')

    inlines = [ModelInline]

    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" style="max-height: 100px;"/>', obj.logo.url)
        return "No logo"
    logo_preview.short_description = "Logo Preview"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(
            actual_vehicle_count=Count('vehicles', distinct=True),
            actual_model_count=Count('models', distinct=True)
        )


@admin.register(Model)
class ModelAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'name', 'make', 'year', 'transmission',
        'fuel_type', 'drivetrain', 'number_of_vehicles', 'created_at'
    )
    list_filter = (
        'transmission', 'fuel_type', 'drivetrain',
        ('make', admin.RelatedOnlyFieldListFilter),
        'year',
    )
    search_fields = ('name', 'make__name', 'engine', 'car_class')
    list_per_page = 50

    fieldsets = (
        ('Basic Information', {
            'fields': (
                ('make', 'name'),
                'year',
            )
        }),
        ('Specifications', {
            'fields': (
                ('transmission', 'fuel_type', 'drivetrain'),
                'engine',
                'car_class',
            )
        }),
        ('Statistics', {
            'fields': ('number_of_vehicles',)
        }),
        ('System Information', {
            'classes': ('collapse',),
            'fields': (
                ('created_at', 'updated_at'),
                ('created_by', 'updated_by'),
            )
        }),
    )

    readonly_fields = ('number_of_vehicles', 'created_at', 'updated_at')
    autocomplete_fields = ['make']

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('make')


@admin.register(Seller)
class SellerAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'name', 'photo_preview', 'phone_number', 'email',
        'city', 'is_dealer', 'whatsapp', 'num_ads', 'created_at'
    )
    list_filter = (
        'is_dealer', 'whatsapp', 'country',
        ('city', admin.RelatedOnlyFieldListFilter),
        ('created_at', admin.DateFieldListFilter),
    )
    search_fields = ('name', 'email', 'phone_number', 'address', 'user__username')
    list_per_page = 50

    fieldsets = (
        ('Basic Information', {
            'fields': (
                'name',
                ('phone_number', 'whatsapp'),
                ('email', 'recovery_email'),
                'photo',
            )
        }),
        ('Location', {
            'fields': (
                'address',
                ('city', 'state', 'country'),
            )
        }),
        ('Account', {
            'fields': (
                'user',
                'is_dealer',
            )
        }),
        ('System Information', {
            'classes': ('collapse',),
            'fields': (
                ('created_at', 'updated_at'),
                ('created_by', 'updated_by'),
            )
        }),
    )

    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ['city', 'user']

    actions = ['mark_as_dealer', 'mark_as_individual']

    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="max-height: 50px; border-radius: 25px;"/>', obj.photo.url)
        return "No photo"
    photo_preview.short_description = "Photo"

    def mark_as_dealer(self, request, queryset):
        updated = queryset.update(is_dealer=True)
        self.message_user(request, f"{updated} seller(s) marked as dealer.")
    mark_as_dealer.short_description = "Mark as dealer"

    def mark_as_individual(self, request, queryset):
        updated = queryset.update(is_dealer=False)
        self.message_user(request, f"{updated} seller(s) marked as individual.")
    mark_as_individual.short_description = "Mark as individual seller"


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'symbol', 'created_at')
    search_fields = ('name', 'symbol')
    list_per_page = 50

    fields = (
        ('name', 'symbol'),
        ('created_at', 'updated_at'),
        ('created_by', 'updated_by'),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'vehicle_count', 'seller_count')
    search_fields = ('name',)
    list_per_page = 50

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(
            _vehicle_count=Count('city', distinct=True),
            _seller_count=Count('seller_city', distinct=True)
        )

    def vehicle_count(self, obj):
        return obj._vehicle_count
    vehicle_count.short_description = "Vehicles"
    vehicle_count.admin_order_field = '_vehicle_count'

    def seller_count(self, obj):
        return obj._seller_count
    seller_count.short_description = "Sellers"
    seller_count.admin_order_field = '_seller_count'


class FAQInline(admin.TabularInline):
    model = FAQ
    extra = 1
    fields = ('question', 'answer')


@admin.register(FAQCategory)
class FAQCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'faq_count')
    search_fields = ('name', 'description')
    list_per_page = 50

    inlines = [FAQInline]

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(_faq_count=Count('faq'))

    def faq_count(self, obj):
        return obj._faq_count
    faq_count.short_description = "FAQ Count"
    faq_count.admin_order_field = '_faq_count'


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'category', 'answer_preview')
    list_filter = (
        ('category', admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ('question', 'answer')
    list_per_page = 50

    fields = (
        'category',
        'question',
        'answer',
    )

    autocomplete_fields = ['category']

    def answer_preview(self, obj):
        if len(obj.answer) > 100:
            return obj.answer[:100] + "..."
        return obj.answer
    answer_preview.short_description = "Answer"


@admin.register(ContactEntry)
class ContactEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'phone', 'message_preview')
    search_fields = ('name', 'email', 'phone', 'message')
    list_per_page = 50
    fields = (
        ('name', 'email', 'phone'),
        'message',
    )

    def message_preview(self, obj):
        if len(obj.message) > 50:
            return obj.message[:50] + "..."
        return obj.message
    message_preview.short_description = "Message"

    def has_add_permission(self, request):  # noqa: ARG002
        # Contact entries should only be created from the frontend
        return False


@admin.register(SavedListing)
class SavedListingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'vehicle_link', 'vehicle_info')
    list_filter = (
        ('user', admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ('user__username', 'vehicle__model__name', 'vehicle__make__name')
    list_per_page = 50

    autocomplete_fields = ['user', 'vehicle']

    def vehicle_link(self, obj):
        url = reverse("admin:auto_app_vehicle_change", args=[obj.vehicle.id])
        return format_html('<a href="{}">{}</a>', url, obj.vehicle.id)
    vehicle_link.short_description = "Vehicle ID"

    def vehicle_info(self, obj):
        return f"{obj.vehicle.make.name} {obj.vehicle.model.name} ({obj.vehicle.year})"
    vehicle_info.short_description = "Vehicle"


@admin.register(SavedSearch)
class SavedSearchAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'filters_preview')
    list_filter = (
        ('user', admin.RelatedOnlyFieldListFilter),
    )
    search_fields = ('user__username', 'filters')
    list_per_page = 50

    fields = (
        'user',
        'filters',
    )

    autocomplete_fields = ['user']

    def filters_preview(self, obj):
        if len(obj.filters) > 100:
            return obj.filters[:100] + "..."
        return obj.filters
    filters_preview.short_description = "Filters"


# Customize admin site header and title
admin.site.site_header = "ZimForward Administration"
admin.site.site_title = "ZimForward Admin Portal"
admin.site.index_title = "Welcome to ZimForward Administration"
