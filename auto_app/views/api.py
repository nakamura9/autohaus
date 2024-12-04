from django.http import JsonResponse
from django.apps import apps
from django.db.models import Q

def search(request, model=None):
    def extract_fields(m, ins):
        fields = m.search_map
        return dict(
            id=ins.pk,
            title=str(ins),
            **{k: str(getattr(ins, fields[k])) for k in fields.keys()}
        )

    klass = apps.get_model("auto_app", model)
    filters = Q()

    for field in klass.search_fields:
        filters.add(Q(**{f"{field}__icontains": request.GET.get("q")}), Q.OR)

    qs = klass.objects.filter(filters)[:20]
    return JsonResponse({"results": [extract_fields(klass, res) for res in qs]})