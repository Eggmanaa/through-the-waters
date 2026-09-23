/* Through the Waters — exhibition script */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     ARTWORK CATALOGUE
     Images are resolved at runtime from the Wikimedia Commons API so the
     exhibition always shows the current public-domain master file.
  ------------------------------------------------------------------ */
  var ART = {
    creation: {
      artist: 'Michelangelo Buonarroti (1475–1564)',
      title: 'The Separation of the Earth from the Waters',
      year: '1511',
      medium: 'Fresco',
      location: 'Sistine Chapel ceiling, Vatican Museums, Vatican City',
      file: 'File:Michelangelo Buonarroti 023.jpg',
      search: 'Michelangelo Separation of Earth from Waters Sistine',
      commons: 'https://commons.wikimedia.org/wiki/File:Michelangelo_Buonarroti_023.jpg',
      label: 'Creation & the Spirit over the Waters'
    },
    flood: {
      artist: 'Michelangelo Buonarroti (1475–1564)',
      title: 'The Deluge (The Flood)',
      year: '1508–1509',
      medium: 'Fresco',
      location: 'Sistine Chapel ceiling, Vatican Museums, Vatican City',
      file: 'File:Michelangelo Buonarroti 020.jpg',
      search: 'Michelangelo Deluge Sistine Chapel',
      commons: 'https://commons.wikimedia.org/wiki/File:Michelangelo_Buonarroti_020.jpg',
      label: "Noah's Ark & the Flood"
    },
    redsea: {
      artist: 'Cosimo Rosselli (1439–1507), with Piero di Cosimo; the cycle also includes work by Sandro Botticelli',
      title: 'The Crossing of the Red Sea',
      year: '1481–1482',
      medium: 'Fresco',
      location: 'Sistine Chapel, south wall, Vatican Museums, Vatican City',
      file: 'File:Cosimo Rosselli Attraversamento del Mar Rosso.jpg',
      search: 'Cosimo Rosselli Crossing of the Red Sea Sistine',
      commons: 'https://commons.wikimedia.org/wiki/File:Cosimo_Rosselli_Attraversamento_del_Mar_Rosso.jpg',
      label: 'Crossing of the Red Sea'
    },
    jordanot: {
      artist: 'Workshop of Raphael (Raffaello Sanzio, 1483–1520)',
      title: 'The Israelites Pass Over the Jordan',
      year: 'c. 1518–1519',
      medium: 'Fresco',
      location: 'Loggia of Raphael, Apostolic Palace, Vatican City',
      file: 'File:Israelites Crossing the Jordan Carrying the Ark of the Covenant by Raphael in the Vatican.jpg',
      search: 'Raphael Loggia Israelites crossing the Jordan',
      commons: 'https://commons.wikimedia.org/wiki/File:Israelites_Crossing_the_Jordan_Carrying_the_Ark_of_the_Covenant_by_Raphael_in_the_Vatican.jpg',
      label: 'Crossing the Jordan River'
    },
    christ: {
      artist: 'Andrea del Verrocchio (c. 1435–1488) and Leonardo da Vinci (1452–1519)',
      title: 'The Baptism of Christ',
      year: 'c. 1472–1475',
      medium: 'Oil and tempera on panel',
      location: 'Galleria degli Uffizi, Florence, Italy',
      file: 'File:Andrea del Verrocchio, Leonardo da Vinci - Baptism of Christ - Uffizi.jpg',
      search: 'Verrocchio Baptism of Christ Uffizi',
      commons: 'https://commons.wikimedia.org/wiki/File:Andrea_del_Verrocchio,_Leonardo_da_Vinci_-_Baptism_of_Christ_-_Uffizi.jpg',
      label: 'The Baptism of Christ'
    }
  };
  var ORDER = ['creation', 'flood', 'redsea', 'jordanot', 'christ'];

  /* Hero banner artwork — shown behind the title */
  var HERO = {
    artist: 'Jan Brueghel the Elder (1568–1625)',
    title: "The Entry of the Animals into Noah's Ark",
    year: '1613',
    medium: 'Oil on panel',
    location: 'J. Paul Getty Museum, Los Angeles, California',
    file: "File:Jan Brueghel the Elder - The Entry of the Animals into Noah's Ark - Google Art Project.jpg",
    search: 'Jan Brueghel Elder Entry of the Animals into Noah Ark Google Art Project',
    commons: 'https://commons.wikimedia.org/wiki/File:Jan_Brueghel_the_Elder_-_The_Entry_of_the_Animals_into_Noah%27s_Ark_-_Google_Art_Project.jpg'
  };

  /* ---------------- Commons image resolution ---------------- */
  function commonsByTitle(title, width) {
    var url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
      '&titles=' + encodeURIComponent(title) +
      '&prop=imageinfo&iiprop=url&iiurlwidth=' + width;
    return fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      var pages = d && d.query && d.query.pages;
      if (!pages) return null;
      var out = null;
      Object.keys(pages).forEach(function (k) {
        var ii = pages[k].imageinfo && pages[k].imageinfo[0];
        if (ii) out = { src: ii.thumburl || ii.url, page: ii.descriptionurl, file: pages[k].title };
      });
      return out;
    }).catch(function () { return null; });
  }

  function commonsSearch(term, width) {
    var url = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*' +
      '&generator=search&gsrnamespace=6&gsrlimit=6&gsrsearch=' + encodeURIComponent(term) +
      '&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=' + width;
    return fetch(url).then(function (r) { return r.json(); }).then(function (d) {
      var pages = d && d.query && d.query.pages;
      if (!pages) return null;
      var best = null;
      Object.keys(pages).forEach(function (k) {
        var p = pages[k];
        if (best) return;
        var ii = p.imageinfo && p.imageinfo[0];
        if (!ii) return;
        if (!/\.(jpe?g|png)$/i.test(p.title)) return;
        best = { src: ii.thumburl || ii.url, page: ii.descriptionurl, file: p.title };
      });
      return best;
    }).catch(function () { return null; });
  }

  function fallbackBox(text) {
    var d = document.createElement('div');
    d.className = 'img-fallback';
    d.textContent = text;
    return d;
  }

  /* ---------------- Plaques ---------------- */
  function plaqueHTML(key) {
    var a = ART[key];
    return '<p class="pl-title">' + a.title + '</p>' +
      '<p class="pl-artist">' + a.artist + '</p>' +
      '<dl>' +
      '<dt>Year</dt><dd>' + a.year + '</dd>' +
      '<dt>Medium</dt><dd>' + a.medium + '</dd>' +
      '<dt>Location</dt><dd>' + a.location + '</dd>' +
      '<dt>Source</dt><dd><a href="' + a.commons + '" target="_blank" rel="noopener">Wikimedia Commons</a></dd>' +
      '</dl>' +
      '<button class="btn" data-view="' + key + '">View Artwork</button>';
  }

  document.querySelectorAll('[data-plaque]').forEach(function (el) {
    el.innerHTML = plaqueHTML(el.getAttribute('data-plaque'));
  });

  /* ---------------- Load images ---------------- */
  var resolved = {};

  function loadArt(key) {
    var a = ART[key];
    return commonsByTitle(a.file, 1600).then(function (res) {
      return res || commonsSearch(a.search, 1600);
    }).then(function (res) {
      resolved[key] = res;
      var holders = document.querySelectorAll('[data-art="' + key + '"]');
      holders.forEach(function (h) {
        if (res) {
          var img = new Image();
          img.alt = a.title + ' — ' + a.artist;
          img.loading = 'lazy';
          img.src = res.src;
          h.insertBefore(img, h.firstChild);
        } else {
          h.insertBefore(fallbackBox(a.title + ' — image unavailable offline. See the Wikimedia Commons link on the plaque.'), h.firstChild);
        }
      });
      return res;
    });
  }

  Promise.all(ORDER.map(loadArt)).then(function () {
    buildThumbs();
    selectArt(currentArt);
  });

  /* Hero banner */
  commonsByTitle(HERO.file, 2400).then(function (res) {
    return res || commonsSearch(HERO.search, 2400);
  }).then(function (res) {
    if (!res) return;
    var hero = document.getElementById('heroArt');
    if (hero) {
      hero.src = res.src;
      hero.alt = '';
    }
    var cred = document.getElementById('heroCredit');
    if (cred) {
      cred.innerHTML = '<em>' + HERO.title + '</em> &middot; ' + HERO.artist + ' &middot; ' + HERO.year +
        ' &middot; ' + HERO.medium + ' &middot; ' + HERO.location +
        ' &middot; <a href="' + HERO.commons + '" target="_blank" rel="noopener">Wikimedia Commons</a>';
    }
  });

  /* ---------------- Lightbox ---------------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');

  function openLB(key) {
    var a = ART[key], r = resolved[key];
    if (!r) { window.open(a.commons, '_blank', 'noopener'); return; }
    lbImg.src = r.src;
    lbImg.alt = a.title;
    lbCap.innerHTML = '<b>' + a.title + '</b>' + a.artist + ' &middot; ' + a.year + ' &middot; ' + a.medium +
      '<br>' + a.location + ' &middot; <a href="' + a.commons + '" target="_blank" rel="noopener">Wikimedia Commons</a>';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLB() { lb.classList.remove('open'); document.body.style.overflow = ''; }

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-view]') : null;
    if (b) { openLB(b.getAttribute('data-view')); }
  });
  document.getElementById('lbClose').addEventListener('click', closeLB);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLB(); });

  /* ------------------------------------------------------------------
     SEGMENT 4 — THE FIVE GRACES
  ------------------------------------------------------------------ */
  var GRACES = [
    {
      n: 1, t: 'Forgiveness of Sins', ccc: 'CCC 1263–1264',
      body: '<p>The first effect of Baptism is the complete removal of sin. This is not a partial cleansing or a fresh start on probation — the Catechism teaches that by Baptism <em>all</em> sins are forgiven.</p>' +
        '<ul>' +
        '<li><b>Original Sin is forgiven</b> — the inherited privation of grace that every human being receives from Adam.</li>' +
        '<li><b>All personal sins are forgiven</b> — every actual sin committed before Baptism, however serious.</li>' +
        '<li><b>All punishment due to sin is remitted.</b> Nothing remains that would keep the baptized from entering the Kingdom.</li>' +
        '<li><b>But concupiscence remains</b> — the disordered inclination toward sin that follows from our wounded nature.</li>' +
        '</ul>' +
        '<p style="margin-top:12px">Concupiscence is not itself sin. The Catechism, quoting the Council of Trent, calls it the <em>fomes peccati</em>, the &ldquo;tinder for sin&rdquo; — the dry kindling left in us that a temptation can set alight. It is left in us deliberately, &ldquo;for the sake of the combat&rdquo;: the Christian life is a genuine spiritual struggle in which grace is exercised and virtue is won.</p>' +
        '<div class="pull">Baptism removes the guilt of sin; it does not remove the battle.</div>'
    },
    {
      n: 2, t: 'A New Creature', ccc: 'CCC 1265–1266',
      body: '<p>Baptism does not merely subtract sin; it gives something positive. The baptized person becomes &ldquo;a new creature,&rdquo; an adopted son or daughter of God, a partaker of the divine nature.</p>' +
        '<ul>' +
        '<li><b>Divine adoption</b> — the baptized truly becomes a child of the Father, able to pray &ldquo;Our Father&rdquo; not by courtesy but by right.</li>' +
        '<li><b>A temple of the Holy Spirit</b> — God comes to dwell within the soul.</li>' +
        '<li><b>Sanctifying grace</b> — the grace of justification, a permanent participation in God&rsquo;s own life.</li>' +
        '<li><b>The three theological virtues</b>, infused directly by God:' +
        '<ul><li><b>Faith</b> — to believe God and all He has revealed.</li>' +
        '<li><b>Hope</b> — to desire and trust in eternal life and the help of grace.</li>' +
        '<li><b>Charity</b> — to love God above all things and our neighbor for His sake.</li></ul></li>' +
        '<li><b>The gifts of the Holy Spirit</b> and the moral virtues, giving the soul the power to live and act under the Spirit&rsquo;s prompting.</li>' +
        '</ul>' +
        '<div class="pull">&ldquo;If any one is in Christ, he is a new creation.&rdquo; &mdash; 2 Corinthians 5:17</div>'
    },
    {
      n: 3, t: 'Incorporation into the Body of Christ', ccc: 'CCC 1267–1270',
      body: '<p>Baptism is never a private transaction between an individual and God. It makes a person a member of the Church, the Body of Christ, with real rights and real responsibilities.</p>' +
        '<ul>' +
        '<li><b>Members of one another</b> — &ldquo;we were all baptized into one body&rdquo; (1 Cor 12:13). Divisions of nation, class, and language are transcended.</li>' +
        '<li><b>&ldquo;Living stones&rdquo;</b> — St. Peter&rsquo;s image: the baptized are built into a spiritual house, a holy priesthood (1 Peter 2:5).</li>' +
        '<li><b>A share in Christ&rsquo;s threefold office:</b>' +
        '<ul><li><b>Priest</b> — offering spiritual sacrifices, joining one&rsquo;s daily life and suffering to Christ&rsquo;s offering.</li>' +
        '<li><b>Prophet</b> — witnessing to the faith by word and by life.</li>' +
        '<li><b>King</b> — serving others and governing one&rsquo;s own passions in freedom.</li></ul></li>' +
        '<li><b>Rights and duties</b> — the baptized may receive the sacraments and are nourished by the Word; they are also bound to profess the faith and to take part in the Church&rsquo;s apostolic mission.</li>' +
        '</ul>' +
        '<p style="margin-top:12px"><b>The common priesthood of the faithful:</b> every baptized person shares in the priesthood of Christ. This is distinct from the ministerial priesthood of ordained men, which serves it — but it is genuine. An ordinary student offering an ordinary day to God is performing a priestly act.</p>'
    },
    {
      n: 4, t: 'The Sacramental Bond of Christian Unity', ccc: 'CCC 1271',
      body: '<p>Baptism constitutes the foundation of communion among <em>all</em> Christians, including those not yet in full communion with the Catholic Church.</p>' +
        '<p style="margin-top:10px">Because valid Baptism is one — administered with water and the Trinitarian formula, with the intention to do what the Church does — those baptized in other Christian communities are truly, if imperfectly, joined to the Catholic Church. They are rightly called Christians and are recognized as brothers and sisters in the Lord.</p>' +
        '<p style="margin-top:10px">This is why the Church does not re-baptize a validly baptized Protestant who enters full communion. The bond already exists; what is completed is the fullness of that communion. Baptism is therefore the real basis of ecumenism: unity is not something Christians must invent, but something already given that must be restored in its fullness.</p>' +
        '<div class="pull">&ldquo;One Lord, one faith, one baptism.&rdquo; &mdash; Ephesians 4:5</div>'
    },
    {
      n: 5, t: 'An Indelible Spiritual Mark', ccc: 'CCC 1272–1274',
      body: '<p>Baptism seals the Christian with an indelible spiritual mark — a <em>character</em> — of belonging to Christ.</p>' +
        '<ul>' +
        '<li><b>A permanent seal on the soul.</b> The mark is imprinted by the sacrament itself and is not erased by any sin. Sin can make the seal fruitless for salvation; it cannot remove it.</li>' +
        '<li><b>The <em>Dominicus character</em></b> — St. Augustine&rsquo;s phrase: &ldquo;the Lord&rsquo;s mark,&rdquo; the brand of ownership by which Christ claims His own, as a shepherd marks his sheep or a king his servants.</li>' +
        '<li><b>Baptism can never be repeated.</b> Because the character is permanent, the sacrament is received once and only once.</li>' +
        '<li><b>A mark for eternal life.</b> The Catechism calls the seal the &ldquo;sacrament of faith&rdquo; that identifies the baptized as belonging to the Lord, and speaks of it as protecting and identifying the soul on the day of judgment.</li>' +
        '</ul>' +
        '<p style="margin-top:12px">This is the effect that reaches furthest. Everything else about a person can change — location, ability, reputation, even fidelity — but the baptismal character remains, a permanent claim of God on a human life.</p>' +
        '<div class="pull">Baptism is not something you once did. It is something you permanently are.</div>'
    }
  ];

  var gl = document.getElementById('graceList');
  gl.innerHTML = GRACES.map(function (g) {
    return '<article class="grace" id="grace' + g.n + '">' +
      '<button class="grace-head" aria-expanded="false" aria-controls="gb' + g.n + '">' +
      '<span class="grace-num">' + g.n + '</span>' +
      '<h3>' + g.t + '<span class="ccc-mini">' + g.ccc + '</span></h3>' +
      '<span class="grace-plus" aria-hidden="true">+</span></button>' +
      '<div class="grace-body" id="gb' + g.n + '"><div class="grace-body-inner">' + g.body + '</div></div>' +
      '</article>';
  }).join('');

  gl.querySelectorAll('.grace-head').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.parentNode;
      var body = card.querySelector('.grace-body');
      var open = card.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.style.maxHeight = open ? body.scrollHeight + 'px' : '0px';
    });
  });
  window.addEventListener('resize', function () {
    gl.querySelectorAll('.grace.open .grace-body').forEach(function (b) {
      b.style.maxHeight = b.scrollHeight + 'px';
    });
  });

  /* ------------------------------------------------------------------
     SEGMENT 5 — SACRED ART DEEP DIVE
  ------------------------------------------------------------------ */
  var ANALYSIS = {
    creation: {
      comp: 'Michelangelo gives the panel to a single figure. God surges toward the viewer in radical foreshortening, arms thrown open above an undefined expanse of water — no landscape, no horizon, nothing to compete with the divine act. Space here is not a place; it is the void being organized.',
      light: 'The Creator appears to be the origin of brightness rather than its recipient, lit from within the composition rather than by any source in the scene. The contrast between luminous flesh and the murky waters below stages the theology of the panel: light emerging out of formless dark.',
      gest: 'Everything is in the hands — both arms extended outward and downward in a gesture of separation, fingers spread, wrists rotated as though dividing one substance from another. The face is set and unstrained: effortless power under complete control.',
      sym: [
        ['Water', 'The formless deep over which the Spirit moves (Gen 1:2) — the first sign of the baptismal font.'],
        ['Open hands', 'Divine command exercised directly, without instrument.'],
        ['Billowing mantle', 'The visual equivalent of <em>ruach</em> — wind, breath, Spirit — sweeping over the waters.'],
        ['Absence of ground', 'Nothing yet exists but God and the water: the instant before order.']
      ],
      link: 'Michelangelo paints an invisible reality using the only visible thing available — a human body in motion. That is what a sacrament does. The fresco makes you watch God bring life out of water, which is precisely the Church’s claim about the font.'
    },
    flood: {
      comp: 'Crowded and fractured, the opposite of the serene Creation scenes nearby. Refugees scramble up a shrinking spit of land, a boat capsizes, and the Ark rides intact far at the back — salvation pushed into the background, human panic into the foreground. The viewer must look past the chaos to find the vessel that saves.',
      light: 'Flat, grey storm light with no heavenly ray anywhere: this is the world under judgment, with the sky closed. The Ark alone catches a warmer tone. Shadow pools around the tangled bodies, tying darkness visually to the sin that occasioned the Flood.',
      gest: 'A man carries a limp son; a woman clutches a child and her possessions; figures claw at the boat while others beat them back. The range of gesture catalogues human response to judgment — tenderness, terror, violence. Nobody in the foreground is looking at the Ark.',
      sym: [
        ['Water', 'Judgment and cleansing at once — a world of sin undone so creation can begin again (CCC 1219).'],
        ['The Ark', 'A figure of the Church: the one vessel carrying the faithful through the waters of death.'],
        ['The wood of the Ark', 'Points forward to the saving wood of the Cross.'],
        ['Bundles and garments', 'What people save when all is lost — and what cannot in fact save them.']
      ],
      link: 'Michelangelo paints the visible catastrophe so the invisible logic becomes clear: death by water is also passage into a renewed world. The viewer is invited to identify not with the doomed foreground but with those inside the vessel.'
    },
    redsea: {
      comp: 'Several moments of Exodus 14 occupy one panoramic field. The Israelites emerge on the right bank in an orderly, upright column; Pharaoh’s army disintegrates in collapsing diagonals at the centre. Verticals for the saved, broken diagonals for the drowned — the theology is legible before a single detail is read.',
      light: 'A weather-heavy sky breaks open above the Israelites, while the Egyptians are painted in deeper shadow within the churning water. Light marks the direction of salvation: the redeemed move toward brightness, their oppressors sink into gloom.',
      gest: 'Moses stands calm amid disaster, rod extended — the human instrument of a divine act. The Israelites lift hands in thanksgiving; in the water, every Egyptian gesture is involuntary. Ordered gesture belongs to the covenant people, chaotic gesture to the power that opposed them.',
      sym: [
        ['Water', 'One element, two outcomes — destruction or deliverance, determined by whom one follows.'],
        ['The rod of Moses', 'Divine power mediated through a chosen minister; a figure of sacramental instrumentality.'],
        ['The pillar of cloud', 'God’s guiding presence, which St. Paul pairs with the sea (1 Cor 10:1–2).'],
        ['Egypt and Pharaoh', 'Slavery to sin and the tyranny of Satan, destroyed behind the crossing believer.']
      ],
      link: 'The fresco hangs in the Sistine Chapel directly opposite the corresponding scene from the life of Christ, so the wall itself argues type against fulfillment. The visible drama of an escaping nation reveals the invisible drama of one soul at the font.'
    },
    jordanot: {
      comp: 'The composition is built around a central void — the dry riverbed. Priests bearing the Ark stand at the midpoint while the people file past them, and the halted water masses improbably to one side. The arrangement is processional: your eye is made to walk across with Israel.',
      light: 'Clear, even, classicizing daylight rather than Michelangelo’s storm — a public, ordered event with a legible middle distance toward Jericho. The gilded Ark is the brightest object in the field. Grace is depicted here as clarity, not rupture.',
      gest: 'The priests stand absolutely still, shouldering the Ark with ceremonial bearing — and the stillness is the miracle, since the water stops only while they stand in it. Around them the people move with purposeful steps, some bending to gather the twelve memorial stones.',
      sym: [
        ['The Jordan', 'The threshold river between wilderness and inheritance — later the site of Christ’s own baptism.'],
        ['The Ark of the Covenant', 'God’s presence going ahead of His people.'],
        ['The twelve stones', 'A permanent memorial of passage — an Old Testament analogue to the baptismal seal.'],
        ['Dry ground', 'Safe passage given, not achieved: the people walk where water should be.']
      ],
      link: 'This fresco depicts the second half of what Baptism does — not the escape but the entry, under a leader whose name is already the prophecy. The visible river reveals an invisible claim on the Kingdom.'
    },
    christ: {
      comp: 'A strict vertical axis. Christ stands at the exact centre, ankle-deep in the Jordan; John is at the right with the bowl, two angels kneel at the left, and directly above Christ’s head are the dove and the hands of the Father. Every line funnels attention up and down that axis. Leonardo’s landscape opens a soft atmospheric depth behind a firmly modelled foreground.',
      light: 'The light divides into two registers: Verrocchio’s crisp, sculptural modelling in front — the clarity of a trained goldsmith — and Leonardo’s <em>sfumato</em> dissolving the distant hills into blue-grey air. Above, the heavens are physically parted and rays descend the central axis. Light here is the visible form of the Father’s voice.',
      gest: 'John’s right hand pours while his body inclines in deference, the posture of a servant who has just protested that he is unworthy. Christ’s hands are joined in prayer, His head bowed, His eyes lowered — the sinless one accepting the place of sinners. Leonardo’s angel turns and looks outward, drawing the viewer into the event rather than leaving them outside it.',
      sym: [
        ['The dove', 'The Holy Spirit descending and resting on Christ.'],
        ['Parted heavens and rays', 'The Father’s voice made visible — the heavens “opened” (Mt 3:16).'],
        ['The bowl — later the scallop shell', 'The instrument of pouring, which becomes the standard emblem of Baptism.'],
        ['The river', 'The Jordan, now sanctified by contact with Christ’s body.'],
        ['The garments held by angels', 'Prefiguring the white robe given to the newly baptized.'],
        ['The reed cross', 'John’s attribute, pointing from this baptism toward the Cross (Lk 12:50).']
      ],
      link: 'Nothing in the Jordan that day could have been photographed except a man standing in a river. Yet Verrocchio and Leonardo make visible the descent of the Spirit, the voice of the Father, and the sanctifying of water itself — exactly the structure of a sacrament, and exactly how the Church asks us to look at a baptism.'
    }
  };

  var currentArt = 'christ';
  var thumbsEl = document.getElementById('thumbs');
  var panelEl = document.getElementById('panel');

  function buildThumbs() {
    thumbsEl.innerHTML = ORDER.map(function (k) {
      var r = resolved[k];
      var img = r ? '<img src="' + r.src + '" alt="" loading="lazy">'
        : '<div class="img-fallback" style="min-height:150px;height:150px;font-size:.8rem">' + ART[k].title + '</div>';
      return '<button class="thumb' + (k === currentArt ? ' sel' : '') + '" data-thumb="' + k + '" role="tab" ' +
        'aria-selected="' + (k === currentArt) + '">' + img +
        '<span class="cap">' + ART[k].label + '</span></button>';
    }).join('');
    thumbsEl.querySelectorAll('[data-thumb]').forEach(function (b) {
      b.addEventListener('click', function () { selectArt(b.getAttribute('data-thumb')); });
    });
  }

  function selectArt(key) {
    currentArt = key;
    var a = ART[key], an = ANALYSIS[key], r = resolved[key];
    thumbsEl.querySelectorAll('[data-thumb]').forEach(function (b) {
      var on = b.getAttribute('data-thumb') === key;
      b.classList.toggle('sel', on);
      b.setAttribute('aria-selected', on);
    });
    var art = r ? '<img src="' + r.src + '" alt="' + a.title + '">'
      : '<div class="img-fallback">' + a.title + '</div>';
    panelEl.innerHTML =
      '<div class="panel-art">' + art + '</div>' +
      '<div class="panel-info">' +
      '<p class="eyebrow">Artwork Analysis Panel</p>' +
      '<h3>' + a.title + '</h3>' +
      '<p class="artist">' + a.artist + ' &middot; ' + a.year + '<br>' + a.medium + ' &middot; ' + a.location + '</p>' +
      '<dl class="analysis">' +
      '<dt>Composition &amp; Space</dt><dd>' + an.comp + '</dd>' +
      '<dt>Lighting &amp; Chiaroscuro</dt><dd>' + an.light + '</dd>' +
      '<dt>Gestures &amp; Expressions</dt><dd>' + an.gest + '</dd>' +
      '<dt>Sacred Symbols</dt><dd><ul class="symlist">' +
      an.sym.map(function (s) { return '<li><b>' + s[0] + '</b> &mdash; ' + s[1] + '</li>'; }).join('') +
      '</ul></dd>' +
      '<dt>Sacramental Link &mdash; <em>visibilia ad invisibilia</em></dt><dd>' + an.link + '</dd>' +
      '</dl>' +
      '<p style="margin-top:24px"><button class="btn" data-view="' + key + '">View Full Artwork</button> ' +
      '<a class="btn" href="' + a.commons + '" target="_blank" rel="noopener">Commons Record</a></p>' +
      '</div>';
  }

  /* ------------------------------------------------------------------
     SEGMENT 8 — WORKS CITED (generated from the catalogue)
  ------------------------------------------------------------------ */
  function citation(a, note) {
    return '<li>' + a.artist + '. <em>' + a.title + '</em>, ' + a.year + '. ' + a.medium + '. ' + a.location +
      '. Wikimedia Commons, <a href="' + a.commons + '" target="_blank" rel="noopener">' + a.commons + '</a>.' +
      (note ? ' <span style="color:var(--gold)">[' + note + ']</span>' : '') + '</li>';
  }
  document.getElementById('srcArt').innerHTML =
    citation(HERO, 'Hero banner image') +
    ORDER.map(function (k) { return citation(ART[k]); }).join('');

  /* ------------------------------------------------------------------
     NAV, PROGRESS, REVEAL
  ------------------------------------------------------------------ */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  var prog = document.getElementById('progress');
  var navA = Array.prototype.slice.call(links.querySelectorAll('a'));
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    prog.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    var pos = h.scrollTop + 120, active = null;
    navA.forEach(function (a) {
      var sec = document.querySelector(a.getAttribute('href'));
      if (sec && sec.offsetTop <= pos) active = a;
    });
    navA.forEach(function (a) { a.classList.toggle('active', a === active); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }
})();
