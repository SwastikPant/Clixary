import django_filters
from .models import Image


class ImageFilter(django_filters.FilterSet):
    event = django_filters.NumberFilter(field_name='event_id')

    photographer = django_filters.CharFilter(
        field_name='uploaded_by__username',
        lookup_expr='icontains'
    )

    privacy = django_filters.ChoiceFilter(
        choices=Image.PRIV_CHOICES
    )

    uploaded_after = django_filters.DateTimeFilter(
        field_name='uploaded_at',
        lookup_expr='gte'
    )

    uploaded_before = django_filters.DateTimeFilter(
        field_name='uploaded_at',
        lookup_expr='lte'
    )

    tags = django_filters.CharFilter(method='filter_by_tags')

    class Meta:
        model = Image
        fields = ['event', 'photographer', 'privacy']

    def filter_by_tags(self, queryset, name, value):

        if not value:
            return queryset

        tag_names = [tag.strip().lower() for tag in value.split(',') if tag.strip()]

        if not tag_names:
            return queryset

        for tag_name in tag_names:
            queryset = queryset.filter(tags__name__iexact=tag_name)

        result = queryset.distinct()

        return result
