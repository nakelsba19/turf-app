// ==========================================
// TurfScore - Application JavaScript
// Horse racing pronostics & results app
// ==========================================

(function () {
  'use strict';

  // ==========================================
  // DATA - Mock realistic French horse racing
  // ==========================================

  const HIPPODROMES = [
    'Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Banfora',
    'Ouahigouya', 'Kaya', 'Dédougou', 'Fada N\'Gourma',
    'Tenkodogo', 'Ziniaré', 'Manga', 'Gaoua',
    'Dori', 'Kongoussi'
  ];

  const HORSE_NAMES = [
    'Wend Panga', 'Sabari', 'Barkwendé', 'Faso Djan',
    'Tégwendé', 'Nongma', 'Wendmi', 'Burkindi',
    'Kiswendé', 'Raogo', 'Poko Diamant', 'Salam du Sahel',
    'Nogma Éclair', 'Pagla Tonnerre', 'Sidwaya', 'Zoodo',
    'Tiiga Noble', 'Belem Star', 'Naaba Royal', 'Wakat Rapide',
    'Bazèga Foudre', 'Sindou Champion', 'Karfiguéla', 'Dafra Prince',
    'Ténéré Brave', 'Mouhoun Force', 'Nakambé Star', 'Kanazoé Vif',
    'Yennenga', 'Ouidi Courage', 'Kompienga', 'Banwa Éclair',
    'Tibo Puissant', 'Laafi Bonheur', 'Nayala Express', 'Zorgho Spirit',
    'Tampouy Flash', 'Dassari Belle', 'Lobi Champion', 'Gurunsi Fier'
  ];

  const JOCKEYS = [
    'I. Ouédraogo', 'M. Sawadogo', 'A. Compaoré', 'S. Kaboré', 'D. Traoré',
    'B. Zongo', 'H. Somé', 'Y. Coulibaly', 'K. Diallo', 'P. Kindo',
    'F. Nikiéma', 'T. Bamba', 'R. Sanou', 'J. Tapsoba', 'O. Ilboudo',
    'L. Zoungrana', 'E. Kaboré', 'N. Ouattara', 'C. Dao', 'G. Bationo'
  ];

  const ENTRAINEURS = [
    'A. Kaboré', 'M. Ouédraogo', 'S. Compaoré', 'I. Traoré', 'B. Sawadogo',
    'D. Zongo', 'K. Somé', 'F. Coulibaly', 'H. Diallo', 'Y. Sanou',
    'T. Nikiéma', 'R. Ilboudo', 'J. Ouattara', 'P. Tapsoba', 'L. Bationo'
  ];

  const RACE_NAMES = [
    'Grand Prix de Ouagadougou', 'Prix du Faso', 'Prix de l\'Indépendance',
    'Prix du Sahel', 'Grand Prix de Bobo-Dioulasso', 'Prix du Mouhoun',
    'Prix de la Réconciliation', 'Prix du SIAO', 'Prix Yennenga',
    'Grand Prix du Kadiogo', 'Prix de Banfora', 'Prix des Cascades',
    'Prix du Nahouri', 'Prix Thomas Sankara', 'Prix de la CEDEAO',
    'Prix du Comoé', 'Prix de Koudougou', 'Prix du Boulkiemdé',
    'Prix de la Paix', 'Prix du Nakambé', 'Prix de Ziniaré',
    'Grand Prix de l\'Oubritenga', 'Prix de la Solidarité', 'Prix du Sourou',
    'Prix de Ouahigouya', 'Prix du Yatenga', 'Prix de Dédougou',
    'Grand Prix National', 'Prix du Bazèga', 'Prix de Kaya'
  ];

  // ==========================================
  // Generate realistic mock data
  // ==========================================

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[rand(0, arr.length - 1)];
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = rand(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function generateHorse(num) {
    const name = HORSE_NAMES[num % HORSE_NAMES.length];
    const odds = (Math.random() * 25 + 1.5).toFixed(1);
    const grades = ['A', 'A', 'B', 'B', 'B', 'C'];
    const perfHistory = Array.from({ length: 8 }, () => {
      const r = Math.random();
      return r < 0.25 ? 'win' : r < 0.5 ? 'place' : 'lose';
    });
    const winRate = rand(5, 45);
    const placeRate = rand(winRate, Math.min(winRate + 35, 80));

    return {
      number: num + 1,
      name,
      jockey: pick(JOCKEYS),
      entraineur: pick(ENTRAINEURS),
      odds: parseFloat(odds),
      grade: pick(grades),
      age: rand(3, 9),
      sex: pick(['M', 'H', 'F']),
      poids: (rand(54, 62) + Math.random()).toFixed(1),
      perfHistory,
      winRate,
      placeRate,
      avgSpeed: (rand(55, 68) + Math.random()).toFixed(1),
      insight: generateInsight(name),
    };
  }

  function generateInsight(horseName) {
    const insights = [
      `${horseName} montre une forme ascendante sur ses 3 dernières courses avec un temps moyen en progression constante.`,
      `Terrain favorable aujourd'hui. ${horseName} excelle sur ce type de piste sahélienne et cette distance.`,
      `${horseName} retrouve son jockey de prédilection après 2 courses décevantes. Le duo affiche 40% de victoires ensemble.`,
      `Attention à ${horseName} qui revient après un repos et pourrait créer la surprise à une belle cote.`,
      `${horseName} est en pleine confiance après sa victoire au Grand Prix de Ouagadougou. Profil idéal pour cette course.`,
      `Chaleur prévue aujourd'hui, ce qui convient au profil de ${horseName} habitué aux conditions du Burkina.`,
      `${horseName} a un excellent palmarès sur cet hippodrome avec 3 victoires en 5 participations.`,
    ];
    return pick(insights);
  }

  function generateRace(reunionIdx, raceIdx, hippodrome, type, baseHour) {
    const numHorses = rand(8, 16);
    const horses = [];
    const usedNames = new Set();
    for (let i = 0; i < numHorses; i++) {
      let horse;
      do {
        horse = generateHorse(i);
      } while (usedNames.has(horse.name));
      usedNames.add(horse.name);
      horses.push(horse);
    }
    horses.sort((a, b) => a.odds - b.odds);

    const hour = baseHour + Math.floor(raceIdx * 0.5);
    const minute = (raceIdx % 2 === 0) ? rand(0, 15) : rand(30, 50);
    const distances = type === 'Trot'
      ? [2100, 2700, 2850, 3000, 2150, 2600]
      : [1200, 1400, 1600, 1800, 2000, 2400, 3200];

    const status = getTimeBasedStatus(hour, minute);

    return {
      id: `R${reunionIdx + 1}C${raceIdx + 1}`,
      reunionIndex: reunionIdx,
      raceNumber: raceIdx + 1,
      name: RACE_NAMES[(reunionIdx * 8 + raceIdx) % RACE_NAMES.length],
      hippodrome,
      type,
      time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      distance: pick(distances),
      terrain: pick(['Bon', 'Sec', 'Sablonneux', 'Poussiéreux', 'Ferme', 'Souple']),
      dotation: `${rand(500, 5000)}000`,
      status,
      horses,
      pronostic: generatePronostic(horses),
      result: status === 'finished' ? generateResult(horses) : null,
    };
  }

  function getTimeBasedStatus(hour, minute) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const raceMinutes = hour * 60 + minute;
    if (raceMinutes < currentMinutes - 30) return 'finished';
    if (raceMinutes <= currentMinutes + 5) return 'live';
    return 'upcoming';
  }

  function generatePronostic(horses) {
    const sorted = [...horses].sort((a, b) => {
      const scoreA = a.winRate * 2 + a.placeRate - a.odds * 3;
      const scoreB = b.winRate * 2 + b.placeRate - b.odds * 3;
      return scoreB - scoreA;
    });
    const confidence = sorted[0].winRate > 30 ? 'high' : sorted[0].winRate > 20 ? 'medium' : 'low';
    return {
      picks: sorted.slice(0, 5),
      confidence,
      confidenceLabel: confidence === 'high' ? 'Confiance forte' : confidence === 'medium' ? 'Confiance moyenne' : 'Confiance faible',
    };
  }

  function generateResult(horses) {
    const shuffled = shuffle(horses);
    const top5 = shuffled.slice(0, 5);
    const tierce = `${top5[0].number}-${top5[1].number}-${top5[2].number}`;
    return {
      arrivee: top5,
      rapports: {
        'Simple gagnant': (top5[0].odds * (0.8 + Math.random() * 0.4) * 500).toFixed(0),
        'Simple placé': (top5[0].odds * 0.4 * 500).toFixed(0),
        'Couplé gagnant': (top5[0].odds * top5[1].odds * 0.6 * 500).toFixed(0),
        'Tiercé ordre': (top5[0].odds * top5[1].odds * top5[2].odds * 0.3 * 500).toFixed(0),
      },
      tierce,
    };
  }

  function generateReunion(idx, dayOffset) {
    const hippodrome = HIPPODROMES[idx % HIPPODROMES.length];
    const types = ['Trot', 'Galop', 'Obstacle'];
    const type = types[idx % types.length];
    const numRaces = rand(7, 9);
    const baseHour = rand(8, 11);
    const races = [];
    for (let i = 0; i < numRaces; i++) {
      races.push(generateRace(idx, i, hippodrome, type, baseHour));
    }

    const statuses = races.map(r => r.status);
    let reunionStatus = 'upcoming';
    if (statuses.includes('live')) reunionStatus = 'live';
    else if (statuses.every(s => s === 'finished')) reunionStatus = 'finished';
    else if (statuses.some(s => s === 'finished')) reunionStatus = 'live';

    // Past days are always finished
    if (dayOffset < 0) {
      reunionStatus = 'finished';
      races.forEach(r => {
        r.status = 'finished';
        if (!r.result) r.result = generateResult(r.horses);
      });
    }
    // Future days are always upcoming
    if (dayOffset > 0) {
      reunionStatus = 'upcoming';
      races.forEach(r => { r.status = 'upcoming'; r.result = null; });
    }

    return {
      id: `R${idx + 1}`,
      index: idx,
      hippodrome,
      type,
      typeIcon: type === 'Trot' ? '🏇' : type === 'Galop' ? '🐎' : '🏁',
      numRaces,
      races,
      status: reunionStatus,
    };
  }

  function generateDayData(dayOffset) {
    const numReunions = rand(3, 5);
    const reunions = [];
    for (let i = 0; i < numReunions; i++) {
      reunions.push(generateReunion(i, dayOffset));
    }
    return reunions;
  }

  // ==========================================
  // APP STATE
  // ==========================================

  const state = {
    currentPage: 'home',
    selectedDate: 0, // offset from today
    dayData: {},
    expandedReunions: new Set(),
    expandedHorses: new Set(),
    selectedRace: null,
    detailTab: 'pronos',
    filter: 'all',
  };

  function getDayData(offset) {
    if (!state.dayData[offset]) {
      state.dayData[offset] = generateDayData(offset);
    }
    return state.dayData[offset];
  }

  // ==========================================
  // ROUTER / NAVIGATION
  // ==========================================

  const mainContent = document.getElementById('mainContent');
  const navItems = document.querySelectorAll('.nav-item');
  const dateScroll = document.getElementById('dateScroll');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalContent = document.getElementById('modalContent');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      navigateTo(page);
    });
  });

  function navigateTo(page) {
    state.currentPage = page;
    state.selectedRace = null;
    navItems.forEach(n => n.classList.toggle('active', n.dataset.page === page));
    renderPage();
  }

  function renderPage() {
    mainContent.classList.add('fade-in');
    setTimeout(() => mainContent.classList.remove('fade-in'), 300);

    switch (state.currentPage) {
      case 'home': renderHome(); break;
      case 'races': renderRaces(); break;
      case 'pronostics': renderPronostics(); break;
      case 'resultats': renderResultats(); break;
      case 'profil': renderProfil(); break;
    }
  }

  // ==========================================
  // DATE NAV
  // ==========================================

  function buildDateNav() {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    let html = '';
    for (let i = -3; i <= 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const label = i === 0 ? "Auj." : days[d.getDay()];
      html += `
        <button class="date-chip ${i === state.selectedDate ? 'active' : ''}" data-offset="${i}">
          <span class="day-name">${label}</span>
          <span class="day-num">${d.getDate()} ${months[d.getMonth()]}</span>
        </button>`;
    }
    dateScroll.innerHTML = html;

    dateScroll.querySelectorAll('.date-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        state.selectedDate = parseInt(chip.dataset.offset);
        buildDateNav();
        renderPage();
      });
    });

    // Scroll active into view
    const active = dateScroll.querySelector('.active');
    if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }

  document.getElementById('prevDay').addEventListener('click', () => {
    state.selectedDate--;
    buildDateNav();
    renderPage();
  });

  document.getElementById('nextDay').addEventListener('click', () => {
    state.selectedDate++;
    buildDateNav();
    renderPage();
  });

  // ==========================================
  // HOME PAGE
  // ==========================================

  function renderHome() {
    const reunions = getDayData(state.selectedDate);
    const liveRaces = reunions.flatMap(r => r.races).filter(r => r.status === 'live');
    const upcomingRaces = reunions.flatMap(r => r.races).filter(r => r.status === 'upcoming').slice(0, 3);
    const finishedRaces = reunions.flatMap(r => r.races).filter(r => r.status === 'finished').slice(-3).reverse();

    let html = '';

    // Live banner
    if (liveRaces.length > 0) {
      const race = liveRaces[0];
      html += `
        <div class="live-banner" onclick="window.app.openRaceDetail('${race.id}')">
          <div class="live-banner-header">
            <div class="live-badge"><span class="dot"></span> EN DIRECT</div>
            <span class="live-race-name">${race.id}</span>
          </div>
          <div class="live-race-title">${race.name}</div>
          <div class="live-race-info">
            <span>📍 ${race.hippodrome}</span>
            <span>📏 ${race.distance}m</span>
            <span>🕐 ${race.time}</span>
          </div>
          <div class="live-horses">
            ${race.horses.slice(0, 5).map((h, i) => `
              <div class="live-horse-chip">
                <div class="horse-number n${(i % 8) + 1}">${h.number}</div>
                <div class="live-horse-info">
                  <div class="live-horse-name">${h.name}</div>
                  <div class="live-horse-jockey">${h.jockey}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;
    }

    // Réunions du jour
    html += `
      <div class="section-header">
        <div class="section-title">Réunions du jour</div>
        <button class="section-link" onclick="window.app.navigateTo('races')">Tout voir</button>
      </div>`;

    reunions.forEach((reunion, idx) => {
      const isExpanded = state.expandedReunions.has(idx);
      const typeClass = reunion.type.toLowerCase();
      html += `
        <div class="reunion-card ${isExpanded ? 'expanded' : ''}" id="reunion-${idx}">
          <div class="reunion-header" onclick="window.app.toggleReunion(${idx})">
            <div class="reunion-icon ${typeClass}">${reunion.typeIcon}</div>
            <div class="reunion-info">
              <div class="reunion-name">${reunion.hippodrome}</div>
              <div class="reunion-meta">
                <span class="reunion-type-badge ${typeClass}">${reunion.type}</span>
                <span>${reunion.races[0].time} - ${reunion.races[reunion.races.length - 1].time}</span>
              </div>
            </div>
            <div class="reunion-right">
              <span class="reunion-race-count">${reunion.numRaces} courses</span>
              <span class="reunion-status ${reunion.status}">${
                reunion.status === 'live' ? 'En cours' :
                reunion.status === 'upcoming' ? 'A venir' : 'Terminé'
              }</span>
            </div>
          </div>
          <div class="reunion-races">
            ${reunion.races.map(race => `
              <div class="race-row" onclick="window.app.openRaceDetail('${race.id}')">
                <span class="race-num">C${race.raceNumber}</span>
                <span class="race-time">${race.time}</span>
                <span class="race-name">${race.name}</span>
                <span class="race-distance">${race.distance}m</span>
                <span class="race-status-dot ${race.status}"></span>
              </div>
            `).join('')}
          </div>
        </div>`;
    });

    // Top Pronostics
    if (upcomingRaces.length > 0) {
      html += `
        <div class="section-header">
          <div class="section-title">Top Pronostics IA</div>
          <button class="section-link" onclick="window.app.navigateTo('pronostics')">Tout voir</button>
        </div>`;

      upcomingRaces.forEach(race => {
        html += renderPronoCard(race);
      });
    }

    // Derniers résultats
    if (finishedRaces.length > 0) {
      html += `
        <div class="section-header">
          <div class="section-title">Derniers Résultats</div>
          <button class="section-link" onclick="window.app.navigateTo('resultats')">Tout voir</button>
        </div>`;

      finishedRaces.forEach(race => {
        if (race.result) html += renderResultCard(race);
      });
    }

    if (reunions.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state-icon">🏇</div>
          <div class="empty-state-title">Pas de courses</div>
          <div class="empty-state-text">Aucune réunion programmée pour cette date.</div>
        </div>`;
    }

    mainContent.innerHTML = html;
  }

  // ==========================================
  // RACES PAGE
  // ==========================================

  function renderRaces() {
    const reunions = getDayData(state.selectedDate);

    if (state.selectedRace) {
      renderRaceDetail();
      return;
    }

    let html = `
      <div class="filter-bar">
        <button class="filter-pill ${state.filter === 'all' ? 'active' : ''}" onclick="window.app.setFilter('all')">Toutes</button>
        <button class="filter-pill ${state.filter === 'trot' ? 'active' : ''}" onclick="window.app.setFilter('trot')">Trot</button>
        <button class="filter-pill ${state.filter === 'galop' ? 'active' : ''}" onclick="window.app.setFilter('galop')">Galop</button>
        <button class="filter-pill ${state.filter === 'obstacle' ? 'active' : ''}" onclick="window.app.setFilter('obstacle')">Obstacle</button>
        <button class="filter-pill ${state.filter === 'live' ? 'active' : ''}" onclick="window.app.setFilter('live')">En direct</button>
      </div>`;

    let filtered = reunions;
    if (state.filter === 'trot') filtered = reunions.filter(r => r.type === 'Trot');
    else if (state.filter === 'galop') filtered = reunions.filter(r => r.type === 'Galop');
    else if (state.filter === 'obstacle') filtered = reunions.filter(r => r.type === 'Obstacle');
    else if (state.filter === 'live') filtered = reunions.filter(r => r.status === 'live');

    filtered.forEach((reunion, idx) => {
      const typeClass = reunion.type.toLowerCase();
      html += `
        <div class="reunion-card expanded">
          <div class="reunion-header">
            <div class="reunion-icon ${typeClass}">${reunion.typeIcon}</div>
            <div class="reunion-info">
              <div class="reunion-name">${reunion.hippodrome}</div>
              <div class="reunion-meta">
                <span class="reunion-type-badge ${typeClass}">${reunion.type}</span>
                <span>R${reunion.index + 1} - ${reunion.numRaces} courses</span>
              </div>
            </div>
            <div class="reunion-right">
              <span class="reunion-status ${reunion.status}">${
                reunion.status === 'live' ? 'En cours' :
                reunion.status === 'upcoming' ? 'A venir' : 'Terminé'
              }</span>
            </div>
          </div>
          <div class="reunion-races" style="display:block">
            ${reunion.races.map(race => `
              <div class="race-row" onclick="window.app.openRaceDetail('${race.id}')">
                <span class="race-num">C${race.raceNumber}</span>
                <span class="race-time">${race.time}</span>
                <span class="race-name">${race.name}</span>
                <span class="race-distance">${race.distance}m</span>
                <span class="race-status-dot ${race.status}"></span>
              </div>
            `).join('')}
          </div>
        </div>`;
    });

    if (filtered.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">Aucune course trouvée</div>
          <div class="empty-state-text">Essayez un autre filtre ou une autre date.</div>
        </div>`;
    }

    mainContent.innerHTML = html;
  }

  // ==========================================
  // RACE DETAIL
  // ==========================================

  function renderRaceDetail() {
    const reunions = getDayData(state.selectedDate);
    let race = null;
    for (const r of reunions) {
      for (const c of r.races) {
        if (c.id === state.selectedRace) { race = c; break; }
      }
      if (race) break;
    }
    if (!race) { state.selectedRace = null; renderPage(); return; }

    let html = `
      <div class="race-detail-header">
        <button class="back-btn" onclick="window.app.goBack()">&#8249; Retour</button>
        <div class="race-detail-title">${race.name}</div>
        <div class="race-detail-subtitle">
          <span>📍 ${race.hippodrome}</span>
          <span class="info-separator">|</span>
          <span>📏 ${race.distance}m</span>
          <span class="info-separator">|</span>
          <span>🌱 ${race.terrain}</span>
          <span class="info-separator">|</span>
          <span>🕐 ${race.time}</span>
          <span class="info-separator">|</span>
          <span>💰 ${parseInt(race.dotation).toLocaleString()} FCFA</span>
        </div>
      </div>

      <div class="tab-bar">
        <button class="tab-btn ${state.detailTab === 'pronos' ? 'active' : ''}" onclick="window.app.setDetailTab('pronos')">Pronos IA</button>
        <button class="tab-btn ${state.detailTab === 'partants' ? 'active' : ''}" onclick="window.app.setDetailTab('partants')">Partants</button>
        <button class="tab-btn ${state.detailTab === 'stats' ? 'active' : ''}" onclick="window.app.setDetailTab('stats')">Stats</button>
        ${race.result ? `<button class="tab-btn ${state.detailTab === 'resultats' ? 'active' : ''}" onclick="window.app.setDetailTab('resultats')">Résultats</button>` : ''}
      </div>`;

    switch (state.detailTab) {
      case 'pronos':
        html += renderDetailPronos(race);
        break;
      case 'partants':
        html += renderDetailPartants(race);
        break;
      case 'stats':
        html += renderDetailStats(race);
        break;
      case 'resultats':
        html += renderDetailResults(race);
        break;
    }

    mainContent.innerHTML = html;
  }

  function renderDetailPronos(race) {
    const prono = race.pronostic;
    let html = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div class="section-title">Top Picks IA</div>
        <div class="prono-confidence ${prono.confidence}">${prono.confidenceLabel}</div>
      </div>`;

    prono.picks.forEach((horse, i) => {
      const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze';
      const gradeClass = horse.grade.toLowerCase();
      html += `
        <div class="horse-entry ${state.expandedHorses.has(`${race.id}-${horse.number}`) ? 'expanded' : ''}" id="horse-${race.id}-${horse.number}">
          <div class="horse-entry-header" onclick="window.app.toggleHorse('${race.id}-${horse.number}')">
            <div class="horse-number n${(i % 8) + 1}">${horse.number}</div>
            <div class="horse-entry-info">
              <div class="horse-entry-name">
                ${horse.name}
                <span class="pick-grade ${gradeClass}">${horse.grade}</span>
              </div>
              <div class="horse-entry-meta">${horse.jockey} - Entr. ${horse.entraineur}</div>
            </div>
            <div class="horse-entry-odds">${horse.odds}</div>
          </div>
          <div class="horse-entry-expand">
            <div class="perf-chart">
              ${horse.perfHistory.map(p => `<div class="perf-bar ${p}" style="height:${p === 'win' ? '100' : p === 'place' ? '60' : '25'}%"></div>`).join('')}
            </div>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-value">${horse.winRate}%</div>
                <div class="stat-label">Victoires</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${horse.placeRate}%</div>
                <div class="stat-label">Placé</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${horse.avgSpeed}</div>
                <div class="stat-label">Km/h moy</div>
              </div>
            </div>
            <div class="ai-insight">
              <div class="ai-insight-title">Analyse IA</div>
              <div class="ai-insight-text">${horse.insight}</div>
            </div>
          </div>
        </div>`;
    });

    return html;
  }

  function renderDetailPartants(race) {
    let html = '';
    race.horses.forEach((horse, i) => {
      const gradeClass = horse.grade.toLowerCase();
      html += `
        <div class="horse-entry ${state.expandedHorses.has(`${race.id}-${horse.number}`) ? 'expanded' : ''}">
          <div class="horse-entry-header" onclick="window.app.toggleHorse('${race.id}-${horse.number}')">
            <div class="horse-number n${(i % 8) + 1}">${horse.number}</div>
            <div class="horse-entry-info">
              <div class="horse-entry-name">
                ${horse.name}
                <span class="pick-grade ${gradeClass}">${horse.grade}</span>
              </div>
              <div class="horse-entry-meta">${horse.jockey} | ${horse.age}ans ${horse.sex} | ${horse.poids}kg</div>
            </div>
            <div class="horse-entry-odds">${horse.odds}</div>
          </div>
          <div class="horse-entry-expand">
            <div class="perf-chart">
              ${horse.perfHistory.map(p => `<div class="perf-bar ${p}" style="height:${p === 'win' ? '100' : p === 'place' ? '60' : '25'}%"></div>`).join('')}
            </div>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-value">${horse.winRate}%</div>
                <div class="stat-label">Victoires</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${horse.placeRate}%</div>
                <div class="stat-label">Placé</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${horse.avgSpeed}</div>
                <div class="stat-label">Km/h moy</div>
              </div>
            </div>
            <div class="ai-insight">
              <div class="ai-insight-title">Analyse IA</div>
              <div class="ai-insight-text">${horse.insight}</div>
            </div>
          </div>
        </div>`;
    });
    return html;
  }

  function renderDetailStats(race) {
    const favorites = [...race.horses].sort((a, b) => a.odds - b.odds).slice(0, 5);
    const avgOdds = (race.horses.reduce((s, h) => s + h.odds, 0) / race.horses.length).toFixed(1);
    const bestWinRate = Math.max(...race.horses.map(h => h.winRate));

    let html = `
      <div class="stats-grid" style="margin-bottom:16px">
        <div class="stat-box">
          <div class="stat-value">${race.horses.length}</div>
          <div class="stat-label">Partants</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${avgOdds}</div>
          <div class="stat-label">Cote moy.</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${bestWinRate}%</div>
          <div class="stat-label">Meilleur V%</div>
        </div>
      </div>

      <div class="section-header">
        <div class="section-title">Top 5 - Cotes les plus basses</div>
      </div>`;

    favorites.forEach((horse, i) => {
      const barWidth = Math.max(20, 100 - horse.odds * 4);
      html += `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:10px 12px;background:var(--bg-card);border-radius:var(--radius-md)">
          <div class="horse-number n${(i % 8) + 1}" style="width:28px;height:28px;font-size:11px">${horse.number}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:700;margin-bottom:4px">${horse.name}</div>
            <div style="height:6px;background:var(--bg-elevated);border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${barWidth}%;background:var(--accent-green);border-radius:3px;transition:width 0.5s"></div>
            </div>
          </div>
          <div style="font-size:13px;font-weight:800;color:var(--accent-green)">${horse.odds}</div>
        </div>`;
    });

    // Odds distribution chart
    html += `
      <div class="section-header" style="margin-top:8px">
        <div class="section-title">Distribution des cotes</div>
      </div>
      <div style="display:flex;align-items:flex-end;gap:4px;height:80px;padding:12px;background:var(--bg-card);border-radius:var(--radius-md)">`;

    const oddsRanges = [
      { label: '1-5', min: 1, max: 5 },
      { label: '5-10', min: 5, max: 10 },
      { label: '10-15', min: 10, max: 15 },
      { label: '15-20', min: 15, max: 20 },
      { label: '20+', min: 20, max: 999 },
    ];

    const maxCount = Math.max(...oddsRanges.map(r => race.horses.filter(h => h.odds >= r.min && h.odds < r.max).length));

    oddsRanges.forEach(range => {
      const count = race.horses.filter(h => h.odds >= range.min && h.odds < range.max).length;
      const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
      html += `
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
          <div style="font-size:10px;font-weight:700;color:var(--accent-green)">${count}</div>
          <div style="width:100%;height:${Math.max(4, pct * 0.5)}px;background:var(--accent-green);border-radius:2px;opacity:${0.4 + pct * 0.006}"></div>
          <div style="font-size:9px;color:var(--text-muted)">${range.label}</div>
        </div>`;
    });

    html += '</div>';
    return html;
  }

  function renderDetailResults(race) {
    if (!race.result) return '<div class="empty-state"><div class="empty-state-title">Pas encore de résultats</div></div>';

    const result = race.result;
    let html = `
      <div class="section-header">
        <div class="section-title">Arrivée officielle</div>
      </div>
      <div class="result-podium">`;

    result.arrivee.forEach((horse, i) => {
      html += `
        <div class="podium-entry">
          <div class="podium-position p${i + 1}">${i + 1}${i === 0 ? 'er' : 'e'}</div>
          <div class="horse-number n${(i % 8) + 1}" style="width:28px;height:28px;font-size:11px">${horse.number}</div>
          <div class="podium-horse">
            <div class="podium-horse-name">${horse.name}</div>
            <div class="podium-jockey">${horse.jockey}</div>
          </div>
          <div class="podium-odds">${horse.odds}</div>
        </div>`;
    });

    html += `</div>
      <div class="section-header">
        <div class="section-title">Rapports LONAB</div>
      </div>
      <div class="result-rapports">`;

    Object.entries(result.rapports).forEach(([label, value]) => {
      html += `
        <div class="rapport-chip">
          <span class="rapport-label">${label}</span>
          <span class="rapport-value">${value} FCFA</span>
        </div>`;
    });

    html += '</div>';
    return html;
  }

  // ==========================================
  // PRONOSTICS PAGE
  // ==========================================

  function renderPronostics() {
    const reunions = getDayData(state.selectedDate);
    const allRaces = reunions.flatMap(r => r.races);
    const upcoming = allRaces.filter(r => r.status === 'upcoming' || r.status === 'live');

    let html = `
      <div class="section-header">
        <div class="section-title">Pronostics IA du jour</div>
      </div>
      <div class="filter-bar">
        <button class="filter-pill ${state.filter === 'all' ? 'active' : ''}" onclick="window.app.setFilter('all')">Tous</button>
        <button class="filter-pill ${state.filter === 'high' ? 'active' : ''}" onclick="window.app.setFilter('high')">Confiance forte</button>
        <button class="filter-pill ${state.filter === 'medium' ? 'active' : ''}" onclick="window.app.setFilter('medium')">Confiance moyenne</button>
      </div>`;

    let filtered = upcoming;
    if (state.filter === 'high') filtered = upcoming.filter(r => r.pronostic.confidence === 'high');
    else if (state.filter === 'medium') filtered = upcoming.filter(r => r.pronostic.confidence === 'medium');

    if (filtered.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state-icon">🔮</div>
          <div class="empty-state-title">Pas de pronostics</div>
          <div class="empty-state-text">Les pronostics IA seront disponibles quand des courses seront programmées.</div>
        </div>`;
    } else {
      filtered.forEach(race => {
        html += renderPronoCard(race);
      });
    }

    mainContent.innerHTML = html;
  }

  function renderPronoCard(race) {
    const prono = race.pronostic;
    let html = `
      <div class="prono-card" onclick="window.app.openRaceDetail('${race.id}')">
        <div class="prono-header">
          <div class="prono-race-info">
            <span class="prono-reunion-badge">${race.id}</span>
            <span class="prono-race-name">${race.name}</span>
          </div>
          <div class="prono-confidence ${prono.confidence}">${prono.confidenceLabel}</div>
        </div>
        <div class="prono-time">📍 ${race.hippodrome} - ${race.time} - ${race.distance}m - ${race.terrain}</div>
        <div class="prono-picks">`;

    prono.picks.slice(0, 3).forEach((horse, i) => {
      const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : 'bronze';
      const gradeClass = horse.grade.toLowerCase();
      html += `
          <div class="prono-pick">
            <div class="pick-rank ${rankClass}">${i + 1}</div>
            <div class="pick-info">
              <div class="pick-horse-name">${horse.name}</div>
              <div class="pick-details">
                <span>N°${horse.number}</span>
                <span>${horse.jockey}</span>
                <span>V ${horse.winRate}%</span>
              </div>
            </div>
            <div class="pick-grade ${gradeClass}">${horse.grade}</div>
            <div class="pick-odds">${horse.odds}</div>
          </div>`;
    });

    html += `</div></div>`;
    return html;
  }

  // ==========================================
  // RESULTATS PAGE
  // ==========================================

  function renderResultats() {
    const reunions = getDayData(state.selectedDate);
    const allRaces = reunions.flatMap(r => r.races);
    const finished = allRaces.filter(r => r.status === 'finished' && r.result).reverse();

    let html = `
      <div class="section-header">
        <div class="section-title">Résultats du jour</div>
      </div>`;

    if (finished.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <div class="empty-state-title">Pas encore de résultats</div>
          <div class="empty-state-text">Les résultats apparaîtront ici dès qu'une course sera terminée.</div>
        </div>`;
    } else {
      finished.forEach(race => {
        html += renderResultCard(race);
      });
    }

    mainContent.innerHTML = html;
  }

  function renderResultCard(race) {
    if (!race.result) return '';
    const result = race.result;

    let html = `
      <div class="result-card" onclick="window.app.openRaceDetail('${race.id}')">
        <div class="result-header">
          <div class="result-race-info">
            <span class="result-reunion-badge">${race.id}</span>
            <span class="result-race-name">${race.name}</span>
          </div>
          <span class="result-time">${race.time}</span>
        </div>
        <div class="result-podium">`;

    result.arrivee.slice(0, 3).forEach((horse, i) => {
      html += `
          <div class="podium-entry">
            <div class="podium-position p${i + 1}">${i + 1}${i === 0 ? 'er' : 'e'}</div>
            <div class="horse-number n${(i % 8) + 1}" style="width:24px;height:24px;font-size:10px">${horse.number}</div>
            <div class="podium-horse">
              <div class="podium-horse-name">${horse.name}</div>
              <div class="podium-jockey">${horse.jockey}</div>
            </div>
            <div class="podium-odds">${horse.odds}</div>
          </div>`;
    });

    html += `</div><div class="result-rapports">`;

    Object.entries(result.rapports).slice(0, 3).forEach(([label, value]) => {
      html += `
          <div class="rapport-chip">
            <span class="rapport-label">${label}</span>
            <span class="rapport-value">${value} FCFA</span>
          </div>`;
    });

    html += `</div></div>`;
    return html;
  }

  // ==========================================
  // PROFIL PAGE
  // ==========================================

  function renderProfil() {
    const html = `
      <div class="profile-header">
        <div class="profile-avatar">TS</div>
        <div class="profile-name">TurfScore BF Pro</div>
        <div class="profile-subtitle">Membre depuis Janvier 2025 - Ouagadougou</div>
      </div>

      <div class="profile-stats">
        <div class="profile-stat">
          <div class="profile-stat-value">67%</div>
          <div class="profile-stat-label">Réussite</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">342</div>
          <div class="profile-stat-label">Pronos suivis</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">+18%</div>
          <div class="profile-stat-label">ROI</div>
        </div>
      </div>

      <div class="section-header">
        <div class="section-title">Paramètres</div>
      </div>

      <div class="profile-menu">
        <div class="profile-menu-item">
          <div class="profile-menu-icon" style="background:var(--accent-green-dim)">🔔</div>
          <div class="profile-menu-text">
            <div class="profile-menu-title">Notifications</div>
            <div class="profile-menu-desc">Alertes courses et résultats</div>
          </div>
          <span class="profile-menu-arrow">›</span>
        </div>
        <div class="profile-menu-item">
          <div class="profile-menu-icon" style="background:var(--accent-blue-dim)">🎯</div>
          <div class="profile-menu-text">
            <div class="profile-menu-title">Disciplines favorites</div>
            <div class="profile-menu-desc">Trot, Galop, Obstacle</div>
          </div>
          <span class="profile-menu-arrow">›</span>
        </div>
        <div class="profile-menu-item">
          <div class="profile-menu-icon" style="background:var(--accent-purple-dim)">📊</div>
          <div class="profile-menu-text">
            <div class="profile-menu-title">Historique des pronos</div>
            <div class="profile-menu-desc">Suivi de performance</div>
          </div>
          <span class="profile-menu-arrow">›</span>
        </div>
        <div class="profile-menu-item">
          <div class="profile-menu-icon" style="background:var(--accent-orange-dim)">⚙️</div>
          <div class="profile-menu-text">
            <div class="profile-menu-title">Préférences</div>
            <div class="profile-menu-desc">Thème, langue, format des cotes</div>
          </div>
          <span class="profile-menu-arrow">›</span>
        </div>
        <div class="profile-menu-item">
          <div class="profile-menu-icon" style="background:var(--accent-red-dim)">❓</div>
          <div class="profile-menu-text">
            <div class="profile-menu-title">Aide & Support</div>
            <div class="profile-menu-desc">FAQ, contact, conditions</div>
          </div>
          <span class="profile-menu-arrow">›</span>
        </div>
      </div>

      <div style="text-align:center;padding:24px;color:var(--text-muted);font-size:11px">
        TurfScore BF v1.0.0<br>
        Pronostics & Résultats Hippiques - Burkina Faso
      </div>`;

    mainContent.innerHTML = html;
  }

  // ==========================================
  // CLOCK UPDATE
  // ==========================================

  function updateClock() {
    const now = new Date();
    document.getElementById('currentTime').textContent =
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  // ==========================================
  // PUBLIC API (for onclick handlers)
  // ==========================================

  window.app = {
    navigateTo,

    toggleReunion(idx) {
      if (state.expandedReunions.has(idx)) {
        state.expandedReunions.delete(idx);
      } else {
        state.expandedReunions.add(idx);
      }
      renderPage();
    },

    toggleHorse(key) {
      if (state.expandedHorses.has(key)) {
        state.expandedHorses.delete(key);
      } else {
        state.expandedHorses.add(key);
      }
      renderPage();
    },

    openRaceDetail(raceId) {
      state.selectedRace = raceId;
      state.detailTab = 'pronos';
      state.expandedHorses.clear();
      state.currentPage = 'races';
      navItems.forEach(n => n.classList.toggle('active', n.dataset.page === 'races'));
      renderPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    goBack() {
      state.selectedRace = null;
      renderPage();
    },

    setDetailTab(tab) {
      state.detailTab = tab;
      renderPage();
    },

    setFilter(filter) {
      state.filter = filter;
      renderPage();
    },

    closeModal() {
      modalOverlay.classList.remove('active');
    },
  };

  // Close modal on overlay click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) window.app.closeModal();
  });

  // ==========================================
  // INIT
  // ==========================================

  updateClock();
  setInterval(updateClock, 30000);
  buildDateNav();
  renderHome();

})();
