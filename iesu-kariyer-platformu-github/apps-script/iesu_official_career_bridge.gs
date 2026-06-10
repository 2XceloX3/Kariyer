/**
 * İESU Kariyer Platformu - Resmi site canlı veri köprüsü
 * Mevcut doPost(e) içinde JSON payload.action === 'fetchOfficialCareerSnapshot'
 * geldiğinde fetchOfficialCareerSnapshot_(payload) döndürün.
 */

function fetchOfficialCareerSnapshot_(payload) {
  var sourceUrl = (payload && payload.sourceUrl) || 'https://www.esenyurt.edu.tr/icerik/2355-kariyer-gelistirme-ofisi-koordinatorlugu';
  var fallbackGroups = (payload && payload.fallbackGroups) || [];
  try {
    var response = UrlFetchApp.fetch(sourceUrl, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: { 'User-Agent': 'IESU-Kariyer-Platform/1.0' }
    });
    var code = response.getResponseCode();
    var html = response.getContentText('UTF-8');
    if (code < 200 || code >= 300 || !html) throw new Error('HTTP ' + code);

    // Basit, güvenli çıkarım: sayfadaki kariyer menüsü linklerini yakalar.
    var anchors = [];
    var re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    var m;
    while ((m = re.exec(html)) !== null) {
      var href = normalizeOfficialUrl_(m[1]);
      var title = stripHtml_(m[2]);
      if (!title || !href) continue;
      if (href.indexOf('/icerik/') === -1 && href.indexOf('/kadro/kariyer-gelistirme-ofisi') === -1) continue;
      if (!/kariyer|mezun|staj|mülakat|mulakat|cv|yetenek|danışman|danisman|galeri|yonerge|yönerge|organizasyon|iletişim|iletisim/i.test(title + ' ' + href)) continue;
      anchors.push({ title: title, url: href });
    }

    var groups = groupOfficialCareerLinks_(anchors, fallbackGroups);
    return {
      success: true,
      sourceUrl: sourceUrl,
      fetchedAt: new Date().toISOString(),
      mode: 'live-urlfetch',
      groups: groups.length ? groups : fallbackGroups
    };
  } catch (err) {
    return {
      success: true,
      sourceUrl: sourceUrl,
      fetchedAt: new Date().toISOString(),
      mode: 'fallback-static',
      warning: String(err && err.message || err),
      groups: fallbackGroups
    };
  }
}

function normalizeOfficialUrl_(href) {
  href = String(href || '').trim();
  if (!href || href.indexOf('javascript:') === 0 || href.indexOf('#') === 0) return '';
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
    .replace(/\s+/g, ' ')
    .trim();
}

function groupOfficialCareerLinks_(links, fallbackGroups) {
  var seen = {};
  var clean = links.filter(function (item) {
    var key = item.title + '|' + item.url;
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
  if (!clean.length) return fallbackGroups || [];

  var groups = {
    'Hakkımızda': [],
    'CV & Mülakat Rehberi': [],
    'Kariyer Danışmanlığı': [],
    'Mezunlar': [],
    'İş ve Staj': [],
    'Yetenek Kapısı ve SSS': []
  };
  clean.forEach(function (item) {
    var text = (item.title + ' ' + item.url).toLocaleLowerCase('tr-TR');
    var group = 'Hakkımızda';
    if (/cv|özgeçmiş|ozgecmis|mülakat|mulakat/.test(text)) group = 'CV & Mülakat Rehberi';
    else if (/danışman|danisman|randevu|beklenti/.test(text)) group = 'Kariyer Danışmanlığı';
    else if (/mezun|mentor/.test(text)) group = 'Mezunlar';
    else if (/staj|ilan|iş ilan|is ilan/.test(text)) group = 'İş ve Staj';
    else if (/yetenek|sss|sıkça|sikca|çözüm|cozum|galeri/.test(text)) group = 'Yetenek Kapısı ve SSS';
    groups[group].push(Object.assign({}, item, { panel: inferPanel_(text), tags: [] }));
  });
  return Object.keys(groups).filter(function (name) { return groups[name].length; }).map(function (name) {
    return { group: name, icon: inferIcon_(name), audience: ['student', 'alumni', 'admin'], items: groups[name] };
  });
}

function inferPanel_(text) {
  if (/staj/.test(text)) return 'student-internship';
  if (/ilan|yetenek|çözüm|cozum/.test(text)) return 'student-opportunities';
  if (/cv|özgeçmiş|ozgecmis/.test(text)) return 'cv-builder';
  if (/mülakat|mulakat/.test(text)) return 'student-prep';
  if (/mentor/.test(text)) return 'alumni-mentor';
  if (/mezun/.test(text)) return 'alumni-roadmap';
  if (/galeri/.test(text)) return 'gallery';
  return 'admin-official-content';
}

function inferIcon_(group) {
  if (group === 'CV & Mülakat Rehberi') return 'fa-file-signature';
  if (group === 'Kariyer Danışmanlığı') return 'fa-comments';
  if (group === 'Mezunlar') return 'fa-user-tie';
  if (group === 'İş ve Staj') return 'fa-briefcase';
  if (group === 'Yetenek Kapısı ve SSS') return 'fa-door-open';
  return 'fa-building-columns';
}
