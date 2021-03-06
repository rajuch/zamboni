$(document).ready(function(){
    function incTotalForms() {
        var $totalForms = $('#id_form-TOTAL_FORMS'),
            num = parseInt($totalForms.val()) + 1;
        $totalForms.val(num);
        return num;
    }

    // Populate cells with current collections.
    $('#features td.collection').each(function() {
        var $td = $(this),
            cid = $td.attr('data-collection'),
            $input = $td.find('.collection-ac');
        if (!cid) {
            $td.removeClass('loading');
            $input.show();
            return;
        }
        $.post(document.body.getAttribute('data-featured-collection-url'),
               {'collection': cid}, function(data) {
            $td.removeClass('loading');
            $input.hide();
            $td.find('.current-collection').html(data).show();
        });
    });

    $('#features').delegate('.app select', 'change', function() {
        // Update application id and toggle disabled attr on autocomplete field.
        var $this = $(this),
            $tr = $this.closest('tr'),
            val = $this.val();
        $tr.attr('data-app', val);
        $tr.find('.collection-ac').attr('disabled', !val);
    });
    $('#features').delegate('.remove', 'click', _pd(function() {
        $(this).closest('tr').hide();
        $(this).closest('td').find('input').attr('checked', true);
    }));
    $('#features').delegate('.replace', 'click', _pd(function() {
        var $td = $(this).closest('td');
        $td.find('.collection-ac').show();
        $td.find('input[type=hidden]').val('');
        $(this).parent().html('');
    })).delegate('.collection-ac', 'collectionAdd', function() {
        // Autocomplete for collection add form.
        var $input = $(this),
            $tr = $input.closest('tr'),
            $td = $input.closest('td'),
            $select = $tr.find('.collection-select');
        function selectCollection() {
            var item = JSON.parse($input.attr('data-item'));
            if (item) {
                $td.find('.errorlist').remove();
                var current = template(
                    '<a href="{url}" target="_blank" ' +
                    'class="collectionitem {is_personas}">{name}</a>' +
                    '<a href="#" class="replace">Replace with another collection</a>'
                );
                $td.find('.current-collection').show().html(current({
                    url: item.url,
                    is_personas: item.all_personas ? 'personas-collection' : '',
                    name: item.name
                }));
                $td.find('input[type=hidden]').val(item.id);
                $td.attr('data-collection', item.id);
            }
            $input.val('');
            $input.hide();
        }
        $input.autocomplete({
            minLength: 3,
            width: 300,
            source: function(request, response) {
                $.getJSON(document.body.getAttribute('data-collections-url'),
                          {'app': $input.closest('tr').attr('data-app'),
                           'q': request.term}, response);
            },
            focus: function(event, ui) {
                $input.val(ui.item.name);
                return false;
            },
            select: function(event, ui) {
                $input.val(ui.item.name).attr('data-item', JSON.stringify(ui.item));
                selectCollection();
                return false;
            }
        }).data('autocomplete')._renderItem = function(ul, item) {
            var html = format('<a>{0}<b>ID: {1}</b></a>', [item.name, item.id]);
            return $('<li>').data('item.autocomplete', item).append(html).appendTo(ul);
        };
    });

    $('#features .collection-ac').trigger('collectionAdd');

    $('#add').click(_pd(function() {
        var formId = incTotalForms() - 1,
            emptyForm = $('tfoot').html().replace(/__prefix__/g, formId);
        $('tbody').append(emptyForm);
        $('tbody tr:last-child .collection-ac').trigger('collectionAdd');
    }));
});
