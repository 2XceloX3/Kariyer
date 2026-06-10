/**
 * İESU Kariyer Platformu - Gerçek Görselli Haber Köprüsü v2
 * Mevcut doPost(e) içinde:
 *   if (payload.action === 'fetchIesuNews') return json_(fetchIesuNews_(payload));
 * satırını ekleyin.
 */
function fetchIesuNews_(payload) {
  var sourceUrl = (payload && payload.sourceUrl) || 'https://www.esenyurt.edu.tr/haberler';
  var fallbackFeed = (payload && payload.fallbackFeed) || [];
  try {
    var response = UrlFetchApp.fetch(sourceUrl, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: { 'User-Agent': 'IESU-Kariyer-Platform/1.0 (+https://www.esenyurt.edu.tr)' }
    });
    var code = response.getResponseCode();
    var html = response.getContentText('UTF-8');
    if (code < 200 || code >= 300 || !html) throw new Error('HTTP ' + code);

    var news = extractIesuNewsCards_(html);
    // Liste sayfasında fotoğraf yakalanamazsa her haber detayına girip og:image / ilk img değerini al.
    news = hydrateIesuNewsImages_(news, 8);

    return {
      success: true,
      fetchedAt: new Date().toISOString(),
      mode: news.length ? 'live-urlfetch' : 'fallback-static',
      news: news.length ? news : fallbackFeed
    };
  } catch (err) {
    return {
      success: true,
      fetchedAt: new Date().toISOString(),
      mode: 'fallback-static',
      warning: String(err && err.message || err),
      news: fallbackFeed
    };
  }
}

function extractIesuNewsCards_(html) {
  var out = [];
  var seen = {};
  var anchorRe = /<a[^>]+href=["']([^"']*(?:\/haber\/)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  var m;
  while ((m = anchorRe.exec(html)) !== null) {
    var href = normalizeIesuUrl_(m[1]);
    var chunkStart = Math.max(0, m.index - 1400);
    var chunkEnd = Math.min(html.length, anchorRe.lastIndex + 1400);
    var chunk = html.slice(chunkStart, chunkEnd);
    var title = stripHtml_(m[2]);
    var date = (title.match(/\b\d{2}[\/.]\d{2}[\/.]\d{4}\b/) || chunk.match(/\b\d{2}[\/.]\d{2}[\/.]\d{4}\b/) || [''])[0];
    if (date && title.indexOf(date) === 0) title = title.replace(date, '').trim();
    title = title.replace(/devamını oku/ig, '').replace(/\s+/g, ' ').trim();
    if (!title || title.length < 8) continue;
    var imageUrl = extractFirstImageUrl_(chunk);
    var key = href + '|' + title;
    if (seen[key]) continue;
    seen[key] = true;
    out.push({ type: 'Haber', title: title, date: date, url: href, imageUrl: imageUrl, summary: '' });
    if (out.length >= 12) break;
  }
  return out;
}

function hydrateIesuNewsImages_(items, limit) {
  items = items || [];
  var max = Math.min(items.length, limit || 8);
  for (var i = 0; i < max; i++) {
    if (items[i].imageUrl) continue;
    try {
      var res = UrlFetchApp.fetch(items[i].url, {
        muteHttpExceptions: true,
        followRedirects: true,
        headers: { 'User-Agent': 'IESU-Kariyer-Platform/1.0 (+https://www.esenyurt.edu.tr)' }
      });
      if (res.getResponseCode() >= 200 && res.getResponseCode() < 300) {
        var detail = res.getContentText('UTF-8');
        items[i].imageUrl = extractOgImage_(detail) || extractFirstImageUrl_(detail) || '';
        var desc = extractMetaDescription_(detail);
        if (desc) items[i].summary = desc;
      }
    } catch(e) {}
  }
  return items;
}

function extractOgImage_(html) {
  var text = String(html || '');
  var m = text.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
          text.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
          text.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  return m ? normalizeIesuUrl_(m[1]) : '';
}

function extractMetaDescription_(html) {
  var text = String(html || '');
  var m = text.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
          text.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  return m ? stripHtml_(m[1]).slice(0, 180) : '';
}

function extractFirstImageUrl_(chunk) {
  var text = String(chunk || '');
  var imgMatch = text.match(/<img[^>]+(?:data-src|data-original|src)=["']([^"']+)["']/i);
  if (!imgMatch) return '';
  var url = normalizeIesuUrl_(imgMatch[1]);
  if (/logo|arama|facebook|instagram|linkedin|youtube|whatsapp|circlecon/i.test(url)) return '';
  return url;
}

function normalizeIesuUrl_(href) {
  href = String(href || '').trim();
  if (!href || href.indexOf('javascript:') === 0 || href.indexOf('#') === 0) return '';
  if (href.indexOf('//') === 0) return 'https:' + href;
  if (href.indexOf('http') === 0) return href;
  if (href.charAt(0) !== '/') href = '/' + href;
  return 'https://www.esenyurt.edu.tr' + href;
}

function stripHtml_(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
