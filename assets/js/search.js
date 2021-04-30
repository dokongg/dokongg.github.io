var getPagination = function() {
  $('.pagination').empty();

  var appendHtml = '<a href="#" class="selected-page" data-page="1">1</a>';

  if ( $('#totalCount').val() == 0 ) {
    return;
  }

  var totalPageGroup = Number($('#totalPageGroup').val());
  var endPage = Number($('#endPage').val());
  var endIndex = endPage;

  if ( totalPageGroup > 1 ) {
    endIndex = 5;
  }
  for(var i = 1; i < endIndex; i ++ ) {
    appendHtml += '<a href="#" data-page="' + (i + 1) + '">' + ( i + 1 ) + '</a>';
  }

  $('.pagination').append(appendHtml);
}

var displaySearchResults = function(results, store, initalize) {
    var searchResults = document.getElementById('search-results');

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
    var startIndex = ( currentPage - 1 ) * 5;
    var endIndex = Number($('#endPage').val());
    var currentPageGroup = Number($('#currentPageGroup').val());

    if (results.length) { // Are there any results?
        var appendString = '<div class="search-results">총 <span> class="search-count">' + $('#totalCount').val() + '</span>개의 결과가 있습니다.</div>';

        for (var i = startIndex; i < results.length; i++) {  // Iterate over the results
            var item = store[results[i].ref];
            appendString += '<li><a class="post-link" href="' + item.url + '">'
                            + '<h4 class="post-title">' + item.title + '</h4></a>';
            appendString += '<p>' + item.content.substring(0, 150) + '...</p></li>';

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
      var idx = lunr(function () {
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

          var results = idx.search(searchTerm); // Get lunr to perform a search
          displaySearchResults(results, window.store, true); // We'll write this in the next section
      }
  }
}

var getPage = function() {
      var searchTerm  =$('#searchTerm').val();
      // Initalize lunr with the fields it will be searching on. I've given title
      // a boost of 10 to indicate matches on this field are more important.
      var idx = lunr(function () {
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

          var results = idx.search(searchTerm); // Get lunr to perform a search
          displaySearchResults(results, window.store); // We'll write this in the next section
      }
    }
