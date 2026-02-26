// ==========================================
// TurfScore BF - Application JavaScript
// PMU'B LONAB - Pronostics & résultats
// Courses hippiques françaises pour parieurs burkinabè
// ==========================================

(function () {
  'use strict';

  // ==========================================
  // DATA - Hippodromes français (les courses
  // se déroulent en France, les parieurs
  // misent depuis le Burkina via la LONAB)
  // ==========================================

  const HIPPODROMES = [
    'Vincennes', 'Longchamp', 'Auteuil', 'Chantilly', 'Deauville',
    'Saint-Cloud', 'Maisons-Laffitte', 'Enghien', 'Cagnes-sur-Mer',
    'ParisLongchamp', 'Pau', 'Lyon-Parilly', 'Cabourg', 'Laval',
    'Châteaubriant', 'Compiègne', 'Vichy', 'Craon'
  ];

  const HORSE_NAMES = [
    'Doyen du Clos', 'Flamme Bleue', 'Eclair du Soir', 'Tornade Noire',
    'Prince Galant', 'Belle Etoile', 'Roi du Nord', 'Dame de Coeur',
    'Foudre Rapide', 'Spirit du Vent', 'Ombre Dorée', 'Capitaine Brave',
    'Lady Fortune', 'Valse Royale', 'Baron du Lys', 'Comète Céleste',
    'Duc de Fer', 'Perle Marine', 'Titan Noir', 'Aurore Magique',
    'Chevalier Blanc', 'Saphir Bleu', 'Diamant Rose', 'Tempête Verte',
    'Noble Coeur', 'Zéphyr Léger', 'Luna Stellaire', 'Hercule Fort',
    'Mystère Sombre', 'Victoire Aimée', 'Orage Puissant', 'Sirène Dorée',
    'Fantôme Gris', 'Rêve Éternel', 'Jaguar Félin', 'Cascade Vive',
    'Merlin Sage', 'Athéna Forte', 'Zeus Tonnerre', 'Apollon Brillant'
  ];

  const JOCKEYS = [
    'A. Hamelin', 'F. Nivard', 'J. Gelormini', 'E. Raffin', 'M. Abrivard',
    'B. Rochard', 'D. Bonne', 'C. Soumillon', 'P. Boudot', 'M. Guyon',
    'A. Lemaitre', 'S. Pasquier', 'O. Peslier', 'G. Benoist', 'T. Bachelot',
    'J. Moisan', 'V. Cheminaud', 'R. Thomas', 'L. Dubroeucq', 'P. Bazire'
  ];

  const ENTRAINEURS = [
    'P. Quinton', 'J.M. Bazire', 'S. Guarato', 'F. Souloy', 'R. Lecomte',
    'A. Fabre', 'C. Laffon-Parias', 'F. Head', 'J.C. Rouget', 'Y. Bonnefoy',
    'M. Delzangles', 'H.A. Pantall', 'A. Reynier', 'C. Ferland', 'E. Clayeux'
  ];

  const RACE_NAMES = [
    'Prix de Vincennes', 'Prix du Jockey Club', 'Prix de l\'Arc de Triomphe',
    'Prix d\'Amérique', 'Prix de Cornulier', 'Grand Steeple-Chase',
    'Prix Ganay', 'Prix du Cadran', 'Prix de Diane', 'Prix Vermeille',
    'Prix Robert Papin', 'Prix Maurice de Gheest', 'Prix Jean Prat',
    'Prix du Président de la République', 'Prix de France',
    'Prix Henri Delamarre', 'Prix Paul Viel', 'Prix de Croix',
    'Prix des Lilas', 'Prix de la Forêt', 'Prix Foy',
    'Prix du Petit Couvert', 'Prix Marcel Boussac', 'Prix de Condé',
    'Prix de Fontainebleau', 'Prix de Lutèce', 'Prix de Normandie',
    'Grand Prix de Paris', 'Prix du Bois', 'Prix de Barbeville'
  ];

  // ==========================================
  // PMU'B - Types de paris selon le jour
  // Lun/Mar/Jeu : Quarté (200 FCFA min)
  // Mer/Sam : Tiercé (200 FCFA min)
  // Ven/Dim : 4+1 (300 FCFA min)
  // Couplé : tous les jours (500 FCFA min)
  // ==========================================

  const JOURS_PARIS = {
    0: { type: '4+1', mise: 300, chevaux: 5 },   // Dimanche
    1: { type: 'Quarté', mise: 200, chevaux: 4 }, // Lundi
    2: { type: 'Quarté', mise: 200, chevaux: 4 }, // Mardi
    3: { type: 'Tiercé', mise: 200, chevaux: 3 }, // Mercredi
    4: { type: 'Quarté', mise: 200, chevaux: 4 }, // Jeudi
    5: { type: '4+1', mise: 300, chevaux: 5 },    // Vendredi
    6: { type: 'Tiercé', mise: 200, chevaux: 3 }, // Samedi
  };

  function getPariDuJour(dayOffset) {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return JOURS_PARIS[d.getDay()];
  }

  function getJourSemaine(dayOffset) {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return d.getDay();
  }

  // Décalage horaire : Burkina = GMT (UTC+0), France = UTC+1 (hiver) / UTC+2 (été)
  // On affiche l'heure locale GMT pour les parieurs
  function frenchToGmt(hour, minute) {
    // Simplifié : on retire 1h (heure d'hiver) ou 2h (été)
    const month = new Date().getMonth();
    const offset = (month >= 2 && month <= 9) ? 2 : 1; // mars-oct = été
    let gmtHour = hour - offset;
    if (gmtHour < 0) gmtHour += 24;
    return `${String(gmtHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

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
      `${horseName} montre une forme ascendante sur ses 3 dernières courses. Idéal pour vos paris PMU'B du jour.`,
      `Terrain favorable aujourd'hui. ${horseName} excelle sur ce type de piste et cette distance.`,
      `${horseName} retrouve son jockey après 2 courses décevantes. Le duo affiche 40% de victoires ensemble.`,
      `Attention à ${horseName} qui revient après un repos et pourrait créer la surprise à une belle cote.`,
      `${horseName} est en confiance après sa victoire au Prix de France. Profil idéal pour le Quinté du jour.`,
      `Surface lourde attendue, ce qui convient au profil de ${horseName} qui excelle sur terrain souple.`,
      `${horseName} a un excellent palmarès sur cet hippodrome avec 3 victoires en 5 participations.`,
    ];
    return pick(insights);
  }

  function generateRace(reunionIdx, raceIdx, hippodrome, type, baseHour, dayOffset) {
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

    const frHour = baseHour + Math.floor(raceIdx * 0.5);
    const minute = (raceIdx % 2 === 0) ? rand(0, 15) : rand(30, 50);
    const gmtTime = frenchToGmt(frHour, minute);
    const distances = type === 'Trot'
      ? [2100, 2700, 2850, 3000, 2150, 2600]
      : [1200, 1400, 1600, 1800, 2000, 2400, 3200];

    const status = getTimeBasedStatus(gmtTime);
    const pariJour = getPariDuJour(dayOffset);

    return {
      id: `R${reunionIdx + 1}C${raceIdx + 1}`,
      reunionIndex: reunionIdx,
      raceNumber: raceIdx + 1,
      name: RACE_NAMES[(reunionIdx * 8 + raceIdx) % RACE_NAMES.length],
      hippodrome,
      type,
      time: gmtTime,
      frenchTime: `${String(frHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      distance: pick(distances),
      terrain: pick(['Bon', 'Souple', 'Léger', 'Lourd', 'Collant', 'Très Souple']),
      dotation: `${rand(15, 120)}000`,
      pariType: pariJour.type,
      miseMin: pariJour.mise,
      status,
      horses,
      pronostic: generatePronostic(horses, pariJour),
      result: status === 'finished' ? generateResult(horses, pariJour) : null,
    };
  }

  function getTimeBasedStatus(gmtTime) {
    const now = new Date();
    const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const [h, m] = gmtTime.split(':').map(Number);
    const raceMinutes = h * 60 + m;
    if (raceMinutes < currentMinutes - 30) return 'finished';
    if (raceMinutes <= currentMinutes + 5) return 'live';
    return 'upcoming';
  }

  function generatePronostic(horses, pariJour) {
    const sorted = [...horses].sort((a, b) => {
      const scoreA = a.winRate * 2 + a.placeRate - a.odds * 3;
      const scoreB = b.winRate * 2 + b.placeRate - b.odds * 3;
      return scoreB - scoreA;
    });
    const confidence = sorted[0].winRate > 30 ? 'high' : sorted[0].winRate > 20 ? 'medium' : 'low';
    return {
      picks: sorted.slice(0, Math.max(5, pariJour.chevaux + 1)),
      confidence,
      confidenceLabel: confidence === 'high' ? 'Confiance forte' : confidence === 'medium' ? 'Confiance moyenne' : 'Confiance faible',
      pariType: pariJour.type,
      miseMin: pariJour.mise,
    };
  }

  function generateResult(horses, pariJour) {
    const shuffled = shuffle(horses);
    const top5 = shuffled.slice(0, 5);

    // Rapports selon le type de pari PMU'B
    let rapports = {};
    if (pariJour.type === 'Tiercé') {
      rapports = {
        'Tiercé Ordre': formatGain(top5[0].odds * top5[1].odds * top5[2].odds * 150),
        'Tiercé Désordre': formatGain(top5[0].odds * top5[1].odds * top5[2].odds * 30),
        'Couplé Venant': formatGain(top5[0].odds * top5[1].odds * 25),
        'Simple Venant': formatGain(top5[0].odds * 8 * 100),
      };
    } else if (pariJour.type === 'Quarté') {
      rapports = {
        'Quarté Ordre': formatGain(top5[0].odds * top5[1].odds * top5[2].odds * top5[3].odds * 40),
        'Quarté Désordre': formatGain(top5[0].odds * top5[1].odds * top5[2].odds * top5[3].odds * 8),
        'Tiercé Venant': formatGain(top5[0].odds * top5[1].odds * top5[2].odds * 20),
        'Couplé Venant': formatGain(top5[0].odds * top5[1].odds * 15),
      };
    } else {
      // 4+1
      rapports = {
        '4+1 Ordre': formatGain(top5[0].odds * top5[1].odds * top5[2].odds * top5[3].odds * top5[4].odds * 10),
        '4+1 Désordre': formatGain(top5[0].odds * top5[1].odds * top5[2].odds * top5[3].odds * top5[4].odds * 2),
        'Bonus 4+1': formatGain(top5[0].odds * top5[1].odds * top5[2].odds * top5[3].odds * 5),
        'Quarté Venant': formatGain(top5[0].odds * top5[1].odds * top5[2].odds * top5[3].odds * 3),
      };
    }

    return {
      arrivee: top5,
      rapports,
      tierce: `${top5[0].number}-${top5[1].number}-${top5[2].number}`,
    };
  }

  function formatGain(value) {
    return Math.round(value).toLocaleString('fr-FR');
  }

  function generateReunion(idx, dayOffset) {
    const hippodrome = HIPPODROMES[idx % HIPPODROMES.length];
    const types = ['Trot', 'Galop', 'Obstacle'];
    const type = types[idx % types.length];
    const numRaces = rand(7, 9);
    const baseHour = rand(13, 15); // Heures françaises (13h-15h)
    const races = [];
    for (let i = 0; i < numRaces; i++) {
      races.push(generateRace(idx, i, hippodrome, type, baseHour, dayOffset));
    }

    const statuses = races.map(r => r.status);
    let reunionStatus = 'upcoming';
    if (statuses.includes('live')) reunionStatus = 'live';
    else if (statuses.every(s => s === 'finished')) reunionStatus = 'finished';
    else if (statuses.some(s => s === 'finished')) reunionStatus = 'live';

    if (dayOffset < 0) {
      reunionStatus = 'finished';
      races.forEach(r => {
        r.status = 'finished';
        if (!r.result) r.result = generateResult(r.horses, getPariDuJour(dayOffset));
      });
    }
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
    selectedDate: 0,
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
    // Jours et type de pari PMU'B
    const pariLabels = { 0: '4+1', 1: 'Quarté', 2: 'Quarté', 3: 'Tiercé', 4: 'Quarté', 5: '4+1', 6: 'Tiercé' };
    let html = '';
    for (let i = -3; i <= 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const label = i === 0 ? "Auj." : days[d.getDay()];
      const pariLabel = pariLabels[d.getDay()];
      html += `
        <button class="date-chip ${i === state.selectedDate ? 'active' : ''}" data-offset="${i}">
          <span class="day-name">${label} · ${pariLabel}</span>
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
    const pariJour = getPariDuJour(state.selectedDate);

    let html = '';

    // Bandeau PMU'B du jour
    html += `
      <div class="pmub-banner">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:20px">🎯</span>
            <div>
              <div style="font-size:14px;font-weight:800;color:var(--accent-gold)">PMU'B du jour : ${pariJour.type}</div>
              <div style="font-size:11px;color:var(--text-secondary)">Mise minimum : ${pariJour.mise} FCFA · Couplé : 500 FCFA</div>
            </div>
          </div>
          <div style="font-size:10px;color:var(--text-muted);text-align:right">
            <div>🇧🇫 Heure GMT</div>
            <div>LONAB</div>
          </div>
        </div>
        <div style="font-size:10px;color:var(--text-muted);font-style:italic">« La fortune en fin de course » — Résultats : 3036 ou lonab.bf</div>
      </div>`;

    // Live banner
    if (liveRaces.length > 0) {
      const race = liveRaces[0];
      html += `
        <div class="live-banner" onclick="window.app.openRaceDetail('${race.id}')">
          <div class="live-banner-header">
            <div class="live-badge"><span class="dot"></span> EN DIRECT</div>
            <span class="live-race-name">${race.id} · ECD</span>
          </div>
          <div class="live-race-title">${race.name}</div>
          <div class="live-race-info">
            <span>📍 ${race.hippodrome} 🇫🇷</span>
            <span>📏 ${race.distance}m</span>
            <span>🕐 ${race.time} GMT</span>
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
              <div class="reunion-name">${reunion.hippodrome} 🇫🇷</div>
              <div class="reunion-meta">
                <span class="reunion-type-badge ${typeClass}">${reunion.type}</span>
                <span>${reunion.races[0].time} - ${reunion.races[reunion.races.length - 1].time} GMT</span>
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
          <div class="section-title">Top Pronostics IA · ${pariJour.type}</div>
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
          <div class="empty-state-text">Aucune réunion programmée pour cette date.<br>Consultez le programme sur lonab.bf</div>
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
              <div class="reunion-name">${reunion.hippodrome} 🇫🇷</div>
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
          <span>📍 ${race.hippodrome} 🇫🇷</span>
          <span class="info-separator">|</span>
          <span>📏 ${race.distance}m</span>
          <span class="info-separator">|</span>
          <span>🌱 ${race.terrain}</span>
          <span class="info-separator">|</span>
          <span>🕐 ${race.time} GMT</span>
          <span class="info-separator">|</span>
          <span>💰 ${parseInt(race.dotation).toLocaleString()}€</span>
        </div>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
          <span style="background:var(--accent-gold-dim);color:var(--accent-gold);padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700">PMU'B : ${race.pariType}</span>
          <span style="font-size:11px;color:var(--text-muted)">Mise min. : ${race.miseMin} FCFA · Couplé : 500 FCFA</span>
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
        <div class="section-title">Top Picks IA · ${prono.pariType}</div>
        <div class="prono-confidence ${prono.confidence}">${prono.confidenceLabel}</div>
      </div>
      <div style="background:var(--bg-card);border-radius:var(--radius-md);padding:10px 12px;margin-bottom:14px;border:1px solid var(--border-color)">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">💡 Suggestion ${prono.pariType} PMU'B (${prono.miseMin} FCFA min.)</div>
        <div style="font-size:13px;font-weight:800;color:var(--accent-gold)">${prono.picks.slice(0, getPariDuJour(state.selectedDate).chevaux).map(h => h.number).join(' - ')}</div>
      </div>`;

    prono.picks.forEach((horse, i) => {
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
        <div class="section-title">Rapports PMU'B · ${race.pariType}</div>
      </div>
      <div class="result-rapports">`;

    Object.entries(result.rapports).forEach(([label, value]) => {
      html += `
        <div class="rapport-chip">
          <span class="rapport-label">${label}</span>
          <span class="rapport-value">${value} FCFA</span>
        </div>`;
    });

    html += `</div>
      <div style="margin-top:12px;padding:10px 12px;background:var(--bg-card);border-radius:var(--radius-md);font-size:11px;color:var(--text-muted);border:1px solid var(--border-color)">
        ⏱ Délai de retrait : 7 jours · Gains > 5 000 FCFA : retrait au siège LONAB
      </div>`;
    return html;
  }

  // ==========================================
  // PRONOSTICS PAGE
  // ==========================================

  function renderPronostics() {
    const reunions = getDayData(state.selectedDate);
    const allRaces = reunions.flatMap(r => r.races);
    const upcoming = allRaces.filter(r => r.status === 'upcoming' || r.status === 'live');
    const pariJour = getPariDuJour(state.selectedDate);

    let html = `
      <div class="section-header">
        <div class="section-title">Pronostics IA · ${pariJour.type}</div>
      </div>
      <div style="background:var(--bg-card);border-radius:var(--radius-md);padding:10px 12px;margin-bottom:12px;border:1px solid var(--border-color);font-size:11px;color:var(--text-secondary)">
        🎯 Trouvez les <strong>${pariJour.chevaux} premiers</strong> arrivants · Mise min. : <strong>${pariJour.mise} FCFA</strong> · Couplé quotidien : <strong>500 FCFA</strong>
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
          <div class="empty-state-text">Les pronostics IA seront disponibles quand des courses seront programmées.<br>Programme sur lonab.bf</div>
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
    const pariJour = getPariDuJour(state.selectedDate);
    let html = `
      <div class="prono-card" onclick="window.app.openRaceDetail('${race.id}')">
        <div class="prono-header">
          <div class="prono-race-info">
            <span class="prono-reunion-badge">${race.id}</span>
            <span class="prono-race-name">${race.name}</span>
          </div>
          <div class="prono-confidence ${prono.confidence}">${prono.confidenceLabel}</div>
        </div>
        <div class="prono-time">📍 ${race.hippodrome} 🇫🇷 · ${race.time} GMT · ${race.distance}m · ${race.terrain}</div>
        <div style="background:var(--accent-gold-dim);border-radius:8px;padding:6px 10px;margin-bottom:10px;font-size:11px">
          <span style="color:var(--accent-gold);font-weight:700">${pariJour.type} :</span>
          <span style="color:var(--text-primary);font-weight:800"> ${prono.picks.slice(0, pariJour.chevaux).map(h => h.number).join(' - ')}</span>
        </div>
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
    const pariJour = getPariDuJour(state.selectedDate);

    let html = `
      <div class="section-header">
        <div class="section-title">Résultats PMU'B · ${pariJour.type}</div>
      </div>`;

    if (finished.length === 0) {
      html += `
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <div class="empty-state-title">Pas encore de résultats</div>
          <div class="empty-state-text">Les résultats apparaîtront ici dès qu'une course sera terminée.<br>Résultats aussi disponibles au 3036</div>
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
          <span class="result-time">${race.time} GMT</span>
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
        <div class="profile-avatar">BF</div>
        <div class="profile-name">TurfScore BF Pro</div>
        <div class="profile-subtitle">Parieur PMU'B · Ouagadougou 🇧🇫</div>
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
        <div class="section-title">Rappel PMU'B</div>
      </div>
      <div style="background:var(--bg-card);border-radius:var(--radius-md);padding:14px;margin-bottom:16px;border:1px solid var(--border-color);font-size:12px;color:var(--text-secondary);line-height:1.7">
        <div style="margin-bottom:8px;font-weight:700;color:var(--accent-gold)">📋 Types de paris par jour :</div>
        <div>🔹 <strong>Lun · Mar · Jeu</strong> → Quarté (200 FCFA min.)</div>
        <div>🔹 <strong>Mer · Sam</strong> → Tiercé (200 FCFA min.)</div>
        <div>🔹 <strong>Ven · Dim</strong> → 4+1 (300 FCFA min.)</div>
        <div>🔹 <strong>Tous les jours</strong> → Couplé (500 FCFA min.)</div>
        <div style="margin-top:8px;font-size:11px;color:var(--text-muted)">
          ⏱ Délai de retrait : 7 jours · Gains > 5 000 FCFA au siège LONAB<br>
          📞 Résultats : 3036 · 🌐 lonab.bf
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
            <div class="profile-menu-desc">Alertes courses et résultats PMU'B</div>
          </div>
          <span class="profile-menu-arrow">›</span>
        </div>
        <div class="profile-menu-item">
          <div class="profile-menu-icon" style="background:var(--accent-blue-dim)">🏇</div>
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
          <div class="profile-menu-icon" style="background:var(--accent-orange-dim)">📍</div>
          <div class="profile-menu-text">
            <div class="profile-menu-title">Clubs PMU'B / ECD</div>
            <div class="profile-menu-desc">Trouver un point de vente LONAB</div>
          </div>
          <span class="profile-menu-arrow">›</span>
        </div>
        <div class="profile-menu-item">
          <div class="profile-menu-icon" style="background:var(--accent-red-dim)">❓</div>
          <div class="profile-menu-text">
            <div class="profile-menu-title">Aide & Support</div>
            <div class="profile-menu-desc">FAQ, guide du parieur, conditions</div>
          </div>
          <span class="profile-menu-arrow">›</span>
        </div>
      </div>

      <div style="text-align:center;padding:24px;color:var(--text-muted);font-size:11px">
        TurfScore BF v2.0.0<br>
        PMU'B · LONAB · Burkina Faso 🇧🇫<br>
        « La fortune en fin de course »
      </div>`;

    mainContent.innerHTML = html;
  }

  // ==========================================
  // CLOCK UPDATE (GMT)
  // ==========================================

  function updateClock() {
    const now = new Date();
    document.getElementById('currentTime').textContent =
      `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
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
