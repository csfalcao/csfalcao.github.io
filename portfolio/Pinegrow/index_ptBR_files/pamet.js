var $gifs = $('.gif,.video');
var gifph = 'images/gif.placeholder.png';

var gif_loaders = [];


$gifs.each(function(i, gif) {
    var $gif = $(gif);
    var pic = $gif.attr('src');
    var is_gif = $gif.is('img');
    if(is_gif) {
        $gif.attr('src', gifph);
        $gif.attr('data-src', pic);
    }
    var len = $gif.attr('data-len') || 6000;
    
    var $wrap = $gif.parent();

    var $repeat = $('<a href="#" class="replay"><i class="glyphicon glyphicon-repeat"></i></a>');
    $wrap.append($repeat);
    $repeat.hide();

    $repeat.click(function(event) {
        $repeat.animate({opacity: 0}, 250, function() {
            $repeat.hide();
        });
		if(is_gif) {
        	$gif.attr('src', pic);
        } else {
            $gif.get(0).play();
        }
        setTimeout(function() {
            $repeat.show();
            $repeat.animate({opacity: 1.0}, 250);
        }, len);
        event.preventDefault();
    })

    if(is_gif) {
        var $over = $('<div class="gif-overlay"><p>Loading animated gif... <a href="/index.old.html">Open basic page instead.</a></p></div>');
        $wrap.append($over);
        $over.find('p').hide();
        
        var newImg = new Image;
        newImg.src = pic;
        gif_loaders.push(newImg);
    }
});

var isOnScreen = function($el){
    //from http://upshots.org/javascript/jquery-test-if-element-is-in-viewport-visible-on-screen
    var win = $(window);

    var viewport = {
        top : win.scrollTop(),
        left : win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    var bounds = $el.offset();
    var h = $el.outerHeight();
    bounds.right = bounds.left + $el.outerWidth();
    bounds.bottom = bounds.top + h;

    if(viewport.bottom >= bounds.top && viewport.top <= bounds.bottom) {
        var hoffs = viewport.top - bounds.top;
        if(hoffs < 0) hoffs = 0;
        if(viewport.bottom < bounds.bottom) {
            hoffs += bounds.bottom - viewport.bottom;
        }
        return (h - hoffs)/h;
    }
    return 0;
    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
};


var showGifTimer = null;

var showGifWhenScrolledIntoView = function() {
    showGifTimer = null;

    var max_vis_gif = null;
    var max_vis_p = 0;
    var full = [];
    var hidden = [];

    $gifs.each(function(i, c) {

        var $gif = $(c);
        var pos = isOnScreen($gif); //% on screen

        //console.log(pos);

        if(pos > 0.25) {
            full.push(c);
            max_vis_gif = c;
            max_vis_p = pos;
        } else if(pos > max_vis_p) {
            if(max_vis_gif) {
                //hidden.push(max_vis_gif);
            }
            max_vis_gif = c;
            max_vis_p = pos;
        } else if(pos == 0) {
            hidden.push(c);
        }
    });
    if(max_vis_gif) full.push(max_vis_gif);

    $.each(full, function(i, gif) {
        var $gif = $(gif);
        var $wrap = $gif.parent();
        var $over = $wrap.find('.gif-overlay');
        var $replay = $wrap.find('.replay');
        var len = $gif.attr('data-len') || 6000;

        var is_gif = $gif.is('img');
        
        var pic = $gif.attr('data-src');
        if(pic != $gif.attr('src') || $gif.data('restart-on-show')) {
            if(!$gif.data('image-loader')) {
                if(is_gif) {
                    var newImg = new Image;
                    var longTimeout = setTimeout(function() {
                        $over.find('p').show();
                        longTimeout = null;
                    }, 15000);
                    newImg.onload = function() {
                        $gif.attr('src', pic);
                        $gif.data('image-loader', null);
                        $over.animate({opacity: 0.0}, 250, function() {
                            $over.hide();
                        });
                        setTimeout(function() {
                            $replay.show().css('opacity', 0);
                            $replay.animate({opacity: 1.0}, 250);
                        }, len);
                        if(longTimeout) clearTimeout(longTimeout);
                    }
                    newImg.src = pic;
                    $gif.data('image-loader', newImg);
                    $gif.data('restart-on-show', false);
                    
                    $replay.animate({opacity: 0}, 250, function() {
                        $replay.hide();
                    });
                } else {
                    if(!$gif.data('auto-played')) {
                        $gif.get(0).play();
                        $gif.data('auto-played', true);
                        setTimeout(function() {
                            $replay.show().css('opacity', 0);
                            $replay.animate({opacity: 1.0}, 250);
                        }, len);
                        $replay.animate({opacity: 0}, 250, function() {
                            $replay.hide();
                        });
                    }
                }
                
            }
        }
    });

    $.each(hidden, function(i, gif) {
        var $gif = $(gif);
        var is_gif = $gif.is('img');
        var pic = $gif.attr('src');
        if(!is_gif || pic != gifph) {
            $gif.data('restart-on-show', true);
        }
    });

}

$(window).on('scroll load resize', function() {
    if(showGifTimer) {
        clearTimeout(showGifTimer);
    }
    showGifTimer = setTimeout(showGifWhenScrolledIntoView, 100);
});


var $body = $('body');

var pgCreateVideoModals = function(videos) {

    $.each(videos, function (i, v) {
        $body.append('<div class="modal fade videoModal" id="' + v.id + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="display: none;" data-src="' + v.src + '">\
                        <div class="modal-dialog modal-lg">\
                        <div class="modal-content">\
                        <div class="modal-body"><div class="video-container"></div>\
                </div>\
                <div class="modal-footer">\
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\
                </div>\
                </div>\
                </div>\
                </div>')
    });
}

if(typeof page_videos != 'undefined') pgCreateVideoModals( page_videos );

$('.videoModal').on('show.bs.modal', function(event) {
    var $m = $(event.delegateTarget);
    var src = $m.attr('data-src');
    var $v = $('<iframe width="560" height="315" src="' + src + '&html5=1" frameborder="0" allowfullscreen=""></iframe>');
    $m.find('.video-container').html('').append($v);
});

jQuery(".videoModal, .videoModal .close, .videoModal .btn").on("click", function(e) {
    var $if = $(e.delegateTarget).closest('.videoModal').find('iframe');
    var src = $if.attr("src");
    $if.attr("src", '/empty.html');
    $if.attr("src", src);
});

$('.videoModal').on('show.bs.modal', function(e) {
    var id = $(e.delegateTarget).attr('id');
    ga('send', 'pageview', '/index.html/video/' + id);
    if(typeof mixpanel != 'undefined' && id == 'videoModal') mixpanel.track("Video");
});

var tz = (new Date()).getTimezoneOffset();
if(console && console.log) console.log(tz);
if(tz >= 5*50 && tz <= 8*60) {
    jQuery('.us-only').removeClass('hide');
    //ga('send', 'pageview', '/index.html/us');
}



if(tz <= 2*60 && tz >= -3*60) {
    jQuery('.eu-only').removeClass('hide');
    //jQuery('.eu-only').removeClass('hide');
    //jQuery('.price-p').html('€49');
    //jQuery('.price-c').html('€79');
    //ga('send', 'pageview', '/index.html/us');
}

jQuery('form').on('submit', function(e) {
    ga('send', 'pageview', '/index.html/paypal');
    if(typeof mixpanel != 'undefined') mixpanel.track("PayPal");
});

jQuery('a.download').on('click', function(e) {
    ga('send', 'pageview', '/index.html/download');
    if(typeof mixpanel != 'undefined') {
        mixpanel.track("Download");
        mixpanel.register({'download_done' : true});
    }
});

setTimeout(function() {
    jQuery('a.paddle, button.paddle_button').on('click', function(e) {
        ga('send', 'pageview', '/index.html/paddle');
        if(typeof mixpanel != 'undefined') mixpanel.track("Paddle");
    });
    if(typeof mixpanel != 'undefined') {
        mixpanel.track('Index', {
            'page name' : document.title,
            'url' : window.location.pathname
        });
        mixpanel.register({'index_done' : true});
    }
    if(location.search && location.search.indexOf('done') >= 0) {
        var value = (location.search.indexOf('donecomp') >= 0 ? 74 : 45);
        if(typeof mixpanel != 'undefined') mixpanel.track('Purchase', {
            'value' : value
        });
    }
}, 2000);

jQuery('[data-toggle="tooltip"]').tooltip();
jQuery('[data-toggle="popover"]').popover();

$(function() {
    setTimeout(function() {
        $('.notebar').animate({'margin-top' : 0}, 1000);
    }, 3000);

    if((window.location + "").indexOf('subscribe') >= 0) {
        jQuery('.pricing-subs').removeClass('hide');
    }

    var add_discount = 0.0;
    
    //order form
    var $form = $('.order-form');
    var $form_total = $form.find('.order-form-total-price');
    var $form_button = $form.find('a.order-button');
    
    if((window.location + "").indexOf('cms') >= 0) {
        $form.find('[value="PGPRO_CMSUSER"]').prop('checked', true);
    }
    
    var getDiscount = function(num) {
        var d = 0.0;
    	if(num < 5) {
            d = 0.0;
        } else if(num < 10) {
            d = 0.2;
        } else if(num < 25) {
            d = 0.3;
        } else if(num < 50) {
            d = 0.4;
        } else {
            d = 0.5;
        }
        return d > 0 ? (d + add_discount) : d;
    }
    
    var getPrice = function(product, sub) {
//    	var p = {'PGPRO_COMPANY': 179, 'PGWPPRO_COMPANY': 259, 'PGPRO_CMSUSER': 39};
    	var p = {'PGPRO_COMPANY': 124, 'PGWPPRO_COMPANY': 200, 'PGPRO_CMSUSER': 39};
        var psub = {'PGPRO_COMPANY': 15, 'PGWPPRO_COMPANY': 20, 'PGPRO_CMSUSER': 20};
        return sub ? psub[product] : p[product];
    }
    
    var getCheckoutLink = function(product, num, sub) {
        if(num < 1) return '#';
        var pid = sub ? '505048' : '505045';
        var ak = sub ? '55mk4' : 'z0ns95';
        var price = (num * getDiscountedPrice( getPrice(product, sub), num)).toFixed(2).replace(',', '.');

        var a = md5(price.toString() + ak);
        var pass = 'q:' + num + '|sub:' + (sub ? '1' : '0') + '|p:' + product + '|price:' + price;
        var link = 'https://pay.paddle.com/checkout/' + pid + '?passthrough=' + pass + '&quantity_variable=0&price=' + price + '&auth=' + a;
        return link;
    }

    var getDiscountedPrice = function(price, num) {
    	return price * (1.0 - getDiscount(num));
    }
    
    var formatPrice = function(price, sub) {
        return '$' + price.toFixed(2) + (sub ? ' / mo' : '');
    }

    var order_price = 0;
    
    var update = function() {   	
        var product = 'PGPRO_COMPANY';
        if($form.find('[value="PGWPPRO_COMPANY"]').is(':checked')) product = 'PGWPPRO_COMPANY';
        if($form.find('[value="PGPRO_CMSUSER"]').is(':checked')) product = 'PGPRO_CMSUSER';
        
        var num = parseFloat($form.find('.license-num').val() || '0');
        
        if(product == 'PGPRO_CMSUSER') {
        	//$form.find('.plan[value="pay"]').prop("checked", true);
            //$form.find('.plan[value="sub"]').prop("checked", false).parent().hide();
        } else {
            $form.find('.plan[value="sub"]').parent().show();
        }
        
        var sub = false;
        if($form.find('.plan[value="sub"]').is(':checked')) sub = true;
        
        var price = getDiscountedPrice( getPrice(product, sub), num);
        var total = price * num;
        $form_total.html('<span>Total price</span>' + formatPrice(total, sub) + ' <calc style="font-weight:normal;">(' + num + ' x ' + formatPrice(price) + ') + VAT*</calc>');

        order_price = formatPrice(total, sub);
        
        var discount = getDiscount(num);
        var full_price = getPrice(product, sub);
        
        $form.find('table.order-form-prices > tbody > tr').each(function(i, tr) {
        	var $tr = $(tr);
            var $tds = $tr.find('>td');
            var rowdiscount = parseFloat($tr.attr('data-discount'));
            if(discount == (rowdiscount + add_discount) && num > 0) {
                $tr.addClass('order-form-active-price');
            } else {
                $tr.removeClass('order-form-active-price');
            }
            $($tds.get(2)).html( formatPrice( full_price * (1.0 - rowdiscount - ((rowdiscount > 0) ? add_discount : 0)), sub));
            var desc_discount = '';
            if(rowdiscount > 0) {
                desc_discount = (rowdiscount * 100).toFixed(0) + '%';
                if(add_discount > 0) {
                    desc_discount = '<span class="order-form-regular-price">' + desc_discount + '</span> <span class="order-form-special-price">' + ((rowdiscount + add_discount) * 100).toFixed(0) + '%</span>';
                }
            }
            $($tds.get(1)).html(desc_discount);
        });

        var link = getCheckoutLink(product, num, sub);
        $form_button.attr('href', link);
        $form.attr('action', link);
    }
    
    $form.find('input').on('input change', function(e) {
        update();
    });

    var validate = function(e) {
        var num = parseInt($form.find('.license-num').val() || '0');
        if(!num) {
            alert('Please fill in the number of licenses.');
            e.preventDefault();
        } else {
            if($form.find('.plan[value="sub"]').is(':checked')) {
                alert('NOTE: During the checkout process the monthly fee will be shown as $20 + VAT. Please disregard that information, the correct volume license price of ' + order_price + ' will be used for the initial charge and for monthly payments. Press OK to continue to checkout.');
            }
        }   
    }
    
    $form.on('submit', function(e) {
        validate(e);
    });

    $form_button.on('click', function(e) {
        validate(e);    
    })
    
    if($form.length) {
	    update();
    }
});

var getPgTransId = function() {
    return 'PG' + (new Date().getTime()) + 'T' + Math.ceil(Math.random() * 10000);
}

var getSuccessUrl = function(tid) {
    return 'http://pinegrow.com/done.html?transid=' + tid;
}

var getCheckoutLink = function(productid, pgtransid) {
    var i = {
        '491037' : '15pluox'
    }

    var link = 'http://pay.paddle.com/checkout/' + productid;
    var return_url = getSuccessUrl(pgtransid);

    var url_coded = Base64.encode(return_url).replace(/\+/g, '/').replace(/\-/g, '_');
    var auth = md5(url_coded + i[productid]);

    return link + '?return_url=' + url_coded + '&return_url_auth=' + auth;
}

var decorateCheckoutLink = function($link, tid) {
    //var product = $link.attr('data-product');
    var url = $link.attr('href') + '?passthrough=' + tid;
    $link.attr('href', url);
}




