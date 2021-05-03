var idx;
var results;

var pageEvent = function($target) {
  var page = $target.data('page');
  var currentPage = $('.pagination a.selected-page').data('page');

  if ( currentPage == page ) {
      return;
  }

  var initialize = false;

  $('#currentPage').val(page);
  $('.pagination a').removeClass('selected-page');
  $target.addClass('selected-page');

  if ( $target.hasClass('prev') ) {
      initialize = true;
      prevPageEvent();
  }
  if ( $target.hasClass('next') ) {
      initialize = true;
      nextPageEvent();
  }
  getPage(initialize);
}

var nextPageEvent = function() {
  $('.pagination').empty();
  var currentPageGroup = Number($('#currentPageGroup').val());
  $('#currentPageGroup').val(currentPageGroup + 1);
}

var prevPageEvent = function() {
    $('.pagination').empty();
    var currentPageGroup = Number($('#currentPageGroup').val());
    $('#currentPageGroup').val(currentPageGroup - 1);
}

var getPagination = function() {
    $('.pagination').empty();
    if ( $('#totalCount').val() == 0 ) {
      return;
    }

    var appendHtml = '';
    var currentPage = Number($('#currentPage').val());
    var currentPageGroup = Number($('#currentPageGroup').val());
    var totalPageGroup = Number($('#totalPageGroup').val());
    var endPage = Number($('#endPage').val());
    var startIndex = ( currentPageGroup - 1 ) * 5;

    var endIndex = startIndex + 5 < endPage ? startIndex + 5 : endPage;

    if ( currentPageGroup > 1 ) {
      appendHtml +=  '<a href="#" data-page="' +  (startIndex) + '" class="prev">&laquo;</a>';
    }

    for(var i = startIndex; i < endIndex; i ++ ) {
      appendHtml += '<a href="#" data-page="' + (i + 1) + '">' + (i + 1) + '</a>';
    }

    if ( totalPageGroup > 1 && currentPageGroup != totalPageGroup ) {
      appendHtml +=  '<a href="#" data-page="' + (endIndex + 1) + '" class="next">&raquo;</a>';
    }

    $('.pagination').append(appendHtml);
    $('.pagination a[data-page=' + currentPage + ']').addClass('selected-page');
    $('.pagination a').off('click').on('click', function(e) {
        pageEvent($(e.target));
    });
}

var displaySearchResults = function(results, store, initalize) {
    var searchResults = $('#search-results');

    searchResults.empty();

    var totalCount = results.length;
    var endPage = Math.ceil(totalCount / 5.0);
    var totalPageGroup = Math.ceil(endPage / 5.0);

    $('#totalCount').val(totalCount);
    $('#endPage').val(endPage);
    $('#totalPageGroup').val(totalPageGroup);

    if ( initalize ) {
      getPagination();
    }

    var currentPage = Number($('#currentPage').val());
    var startIndex = (currentPage - 1) * 5;
    var endIndex = Number($('#endPage').val());

    if (results.length) { // Are there any results?
        var appendString = '<div class="search-results">총 <span class="search-count">' + $('#totalCount').val() + '</span>개의 결과가 있습니다.</div>';
        for (var i = startIndex; i < results.length; i++) {  // Iterate over the results
            var item = store[results[i].ref];
            appendString += '<li class="post-delimiter"><a class="post-link search-post-link" href="' + item.url + '">'
                            + '<h4 class="post-title">' + item.title + '</h4>';
            appendString += '<div class="search-post-contents">' + item.content.substring(0, 100) + '</div></a></li>';

            if ( i == startIndex + 4 ) {
              break;
            }
        }

        searchResults.append(appendString);
    } else {
        searchResults.append('<li>검색 결과가 없습니다.</li>');
    }

}

var getQueryVariable = function(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');

        if (pair[0] === variable) {
            return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
        }
    }
}

var trimmerEnKo = function(token) {
  return token
            .replace(/^[^\w가-힣]+/, '')
            .replace(/[^\w가-힣]+$/, '');
};

var init = function() {
  var searchTerm = getQueryVariable('query');

  if (searchTerm) {
      document.getElementById('search-box').setAttribute("value", searchTerm);

      $('#searchTerm').val(searchTerm);
      // Initalize lunr with the fields it will be searching on. I've given title
      // a boost of 10 to indicate matches on this field are more important.
      idx = lunr(function () {
          this.pipeline.reset();
          this.pipeline.add(
              trimmerEnKo,
              lunr.stopWordFilter,
              lunr.stemmer
          );
          this.field('id');
          this.field('title', { boost: 10 });
          this.field('category');
          this.field('content');
      });

      for (var key in window.store) { // Add the data to lunr
          idx.add({
              'id': key,
              'title': window.store[key].title,
              'category': window.store[key].category,
              'content': window.store[key].content
          });
      }

      results = idx.search(searchTerm); // Get lunr to perform a search
      displaySearchResults(results, window.store, true); // We'll write this in the next section
  }
}

var getPage = function(initialize) {
  displaySearchResults(results, window.store, initialize);
}
