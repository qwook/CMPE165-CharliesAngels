// Vertical centered modals
// you can give custom class like this // var modalVerticalCenterClass = ".modal.modal-vcenter";

var modalVerticalCenterClass = ".modal";
function centerModals($element) {
    var $modals;
    if ($element.length) {
        $modals = $element;
    } else {
        $modals = $(modalVerticalCenterClass + ':visible');
    }
    $modals.each( function(i) {
        var $clone = $(this).clone().css('display', 'block').appendTo('body');
        var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
        top = top > 0 ? top : 0;
        $clone.remove();
        $(this).find('.modal-content').css("margin-top", top);
    });
}

var modalFn = $.prototype.modal
$.prototype.modal = function(option, _relatedTarget) {
    modalFn.apply(this, [option, _relatedTarget]);
    centerModals($(this));
}

$(window).on('resize', centerModals);