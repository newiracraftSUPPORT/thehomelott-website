/* =========================================================
   Home Lotts — demo catalogue
   ------------------------------------------------------------
   Every lottery, draw, result and ticket in this file is
   FICTIONAL DEMO DATA created for illustration. No real
   lottery, charity, permit number, prize or result is
   represented here.
   ========================================================= */
(function (global) {
  'use strict';

  // ---- reference tables -------------------------------------------------
  var STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT'];

  var CATEGORIES = [
    { id: 'home',    label: 'Homes',      icon: 'home'   },
    { id: 'car',     label: 'Cars & utes', icon: 'car'    },
    { id: 'cash',    label: 'Cash',       icon: 'cash'   },
    { id: 'holiday', label: 'Holidays',   icon: 'holiday'},
    { id: 'other',   label: 'Other',      icon: 'gift'   }
  ];

  var TICKET_REFS = {
    NSW: 'NSW permit 24/0000-1 · Sweepstakes & Lotteries Act 2001',
    VIC: 'VIC permit 24/0000-2 · Gambling and Liquor Control Act 2003',
    QLD: 'QLD permit 24/0000-3 · Queensland Lotteries Act 2001',
    WA:  'WA  permit 24/0000-4 · Lotteries Act 1997',
    SA:  'SA  permit 24/0000-5 · Lotteries Act 1966',
    TAS: 'TAS permit 24/0000-6 · Lotteries Act 2006',
    NT:  'NT  permit 24/0000-7 · Liquor and Gaming (Lottery) Regulations',
    ACT: 'ACT permit 24/0000-8 · Lotteries Act 2004'
  };

  // ---- lotteries --------------------------------------------------------
  // tiers: [{ rank, label, match, winners, value, valueText }]
  //   `match` = how many of the 6 leading digits must match a drawn number.
  // draws:   [{ id, date, time, status, winningNumbers[], sold, notes, source }]
  var LOTTERIES = [
    {
      id: 'riverina',
      name: 'Riverina Care Foundation — Million Dollar Draw',
      charity: 'Riverina Care Foundation',
      state: 'NSW', region: 'Riverina & Murrumbidgee',
      cause: 'Regional palliative care, rural nursing and respite houses',
      categories: ['cash', 'home'],
      headline: '$1,000,000 cash + a $120,000 home package',
      price: 1, min: 1, max: 20,
      total: 180000, sold: 155640,
      open: '2026-04-02', close: '2026-09-29',
      drawTime: '7:00 pm AEST',
      odds: '1 in 4,200 per $1 ticket',
      dta: TICKET_REFS.NSW,
      enterUrl: 'https://example.org/riverina-million-draw?ref=homelott',
      art: 'teal',
      tag: 'Closing closed',
      supportLine: 'Every ticket keeps a regional family home or nurse on shift overnight.',
      terms: [
        'One (1) prize of $1,000,000 cash and one (1) prize of a $120,000 home package.',
        'Total prize pool $1,120,000. 65% of gross ticket sales are paid to the Foundation.',
        'Draw conducted at the Wagga Wagga Civic Centre under independent supervision.',
        'Must be 18 years or over to purchase. T&Cs of the Foundation apply.'
      ],
      tiers: [
        { rank: 1, label: '1st Prize', match: 6, winners: 1, valueText: '$1,000,000 cash', value: 1000000 },
        { rank: 2, label: 'Home Package', match: 5, winners: 2, valueText: '$120,000 home package', value: 120000 },
        { rank: 3, label: 'Second Chance Cash', match: 4, winners: 25, valueText: '$10,000', value: 10000 },
        { rank: 4, label: 'Community Grant', match: 3, winners: 500, valueText: '$500', value: 500 }
      ],
      draws: [
        { id: 'riverina-d1', date: '2026-09-19', time: '7:00 pm AEST', status: 'drawn', sold: 155640,
          winningNumbers: [903117, 118402, 226540, 407719, 664188, 730004],
          published: '2026-09-19', source: 'demo',
          notes: 'Drawn live on the Foundation livestream. Winning numbers verified against the printed draw sheet.',
          resultPublishedBy: 'Wagga Wagga Civic Centre, 19 September 2026' },
        { id: 'riverina-d0', date: '2026-03-28', time: '7:00 pm AEST', status: 'drawn', sold: 141220,
          winningNumbers: [221904, 118402, 640077, 993115, 337281, 502440],
          published: '2026-03-28', source: 'demo', notes: 'Early-bird draw.' }
      ]
    },
    {
      id: 'sunshine',
      name: "Sunshine Coast Wildlife Rescue Fundraiser",
      charity: 'Sunshine Coast Wildlife Rescue Inc.',
      state: 'QLD', region: 'Sunshine Coast & Fraser',
      cause: 'Koala and koala joey rescue, rehabilitation and koala-safe fencing',
      categories: ['cash', 'other'],
      headline: '$150,000 top cash prize + 10 x $5,000',
      price: 2, min: 1, max: 60,
      total: 120000, sold: 96420,
      open: '2026-05-12', close: '2026-10-02',
      drawTime: '12:00 pm AEST',
      odds: '1 in 3,000 per $2 ticket',
      dta: TICKET_REFS.QLD,
      enterUrl: 'https://example.org/sunshine-wildlife?ref=homelott',
      art: 'leaf',
      supportLine: 'Rescued animals are released within 30 km of the coast they were found on.',
      terms: [
        'One (1) prize of $150,000 cash. Ten (10) prizes of $5,000 cash.',
        'Total prize pool $200,000. 70% of net proceeds fund wildlife rescue.',
        'Draw conducted at the Queensland Suncentre, Maroochydore.',
        'Must be 18 years or over to purchase. T&Cs of the Rescue Inc. apply.'
      ],
      tiers: [
        { rank: 1, label: 'Top Prize', match: 6, winners: 1, valueText: '$150,000 cash', value: 150000 },
        { rank: 2, label: 'Major Prize', match: 5, winners: 10, valueText: '$5,000', value: 5000 },
        { rank: 3, label: 'Runner Up', match: 4, winners: 40, valueText: '$1,000', value: 1000 },
        { rank: 4, label: 'Rescue Supporter', match: 3, winners: 1000, valueText: '$100', value: 100 }
      ],
      draws: [
        { id: 'sunshine-d1', date: '2026-08-15', time: '12:00 pm AEST', status: 'drawn', sold: 84200,
          winningNumbers: [118405, 774102, 305881, 521960, 660017, 909331],
          published: '2026-08-15', source: 'demo',
          notes: 'Six winning numbers drawn from 84,200 eligible tickets.' }
      ]
    },
    {
      id: 'tasman',
      name: 'Tasman Blue Conservation Raffle',
      charity: 'Tasman Blue Landcare Alliance',
      state: 'TAS', region: 'Hobart & Launceston',
      cause: 'Wetland restoration, blue gum forest and shorebird habitat',
      categories: ['cash', 'other'],
      headline: '$500,000 main cash prize',
      price: 1, min: 1, max: 100,
      total: 300000, sold: 88450,
      open: '2026-06-01', close: '2026-11-27',
      drawTime: '2:00 pm AEST',
      odds: '1 in 5,000 per $1 ticket',
      dta: TICKET_REFS.TAS,
      enterUrl: 'https://example.org/tasman-blue?ref=homelott',
      art: 'blue',
      supportLine: 'Refunds 1.2 hectares of coastal wetland for every $4 raised.',
      terms: [
        'One (1) prize of $500,000 cash, one (1) prize of $50,000, one (1) boat package valued at $38,000.',
        'Total prize pool $588,000. 68% of gross sales fund conservation work.',
        'Draw conducted at the Tasmanian Museum and Art Gallery, Hobart.',
        'Must be 18 years or over to purchase. T&Cs of the Alliance apply.'
      ],
      tiers: [
        { rank: 1, label: 'Main Prize', match: 6, winners: 1, valueText: '$500,000', value: 500000 },
        { rank: 2, label: 'Runner Up', match: 5, winners: 3, valueText: '$50,000', value: 50000 },
        { rank: 3, label: 'Boat Package', match: 4, winners: 1, valueText: '$38,000 boat', value: 38000 },
        { rank: 4, label: 'Habitat Fund', match: 3, winners: 2500, valueText: '$200 habitat grant', value: 200 }
      ],
      draws: [
        { id: 'tasman-d1', date: '2026-07-25', time: '2:00 pm AEST', status: 'drawn', sold: 61200,
          winningNumbers: [550300, 118402, 773108, 204455, 881026, 336719],
          published: '2026-07-25', source: 'demo', notes: 'Drawn at the winter gala, with independent auditor present.' }
      ]
    },
    {
      id: 'southerncross',
      name: "Southern Cross Kids' Foundation Vehicle Raffle",
      charity: "Southern Cross Kids' Foundation",
      state: 'VIC', region: 'Melbourne & Geelong',
      cause: "Paediatric nursing, family accommodation and kids' mobility programs",
      categories: ['car', 'cash', 'holiday'],
      headline: 'New SUV + $100,000 cash + family holiday',
      price: 5, min: 1, max: 40,
      total: 40000, sold: 22760,
      open: '2026-04-20', close: '2026-10-30',
      drawTime: '11:00 am AEST',
      odds: '1 in 900 per $5 ticket',
      dta: TICKET_REFS.VIC,
      enterUrl: 'https://example.org/southern-cross-kids?ref=homelott',
      art: 'sunset',
      supportLine: 'Funds the family houses that let families stay beside sick children.',
      terms: [
        'One (1) prize: new mid-size SUV, dealer list price, plus $100,000 cash.',
        'One (1) prize: $40,000 family holiday package. Total prize pool $236,000.',
        'Draw conducted at the MCG, Melbourne, under supervision.',
        'Must be 18 years or over to purchase. T&Cs of the Foundation apply.'
      ],
      tiers: [
        { rank: 1, label: '1st Prize', match: 6, winners: 1, valueText: 'New SUV + $100,000 cash', value: 136000 },
        { rank: 2, label: '2nd Prize', match: 5, winners: 2, valueText: '$20,000', value: 20000 },
        { rank: 3, label: '3rd Prize', match: 4, winners: 10, valueText: '$2,000', value: 2000 },
        { rank: 4, label: 'Family Fund', match: 3, winners: 500, valueText: '$100', value: 100 }
      ],
      draws: [
        { id: 'southerncross-d1', date: '2026-06-20', time: '11:00 am AEST', status: 'drawn', sold: 18400,
          winningNumbers: [220419, 601203, 447712, 903117, 118405, 774102],
          published: '2026-06-20', source: 'demo', notes: 'Vehicle prize inspected and registered by the Foundation before the draw.' }
      ]
    },
    {
      id: 'gippsland',
      name: 'Gippsland Dairy Support Fundraiser',
      charity: 'Gippsland Dairy Support Network',
      state: 'VIC', region: 'Gippsland',
      cause: 'Farmer mental health, dairy farm succession and drought resilience',
      categories: ['cash'],
      headline: '$250,000 main prize + 10 x $10,000',
      price: 2, min: 1, max: 50,
      total: 100000, sold: 51780,
      open: '2026-06-10', close: '2026-11-20',
      drawTime: '6:00 pm AEST',
      odds: '1 in 2,400 per $2 ticket',
      dta: TICKET_REFS.VIC,
      enterUrl: 'https://example.org/gippsland-dairy?ref=homelott',
      art: 'gold',
      supportLine: 'A confidential 24-hour phone line staffed by dairy people, for dairy people.',
      terms: [
        'One (1) prize of $250,000. Ten (10) prizes of $10,000. Total prize pool $350,000.',
        '72% of net ticket sales fund the support line and drought grants.',
        'Draw conducted at the Sale Arts Centre, under independent supervision.',
        'Must be 18 years or over to purchase. T&Cs of the Network apply.'
      ],
      tiers: [
        { rank: 1, label: '1st Prize', match: 6, winners: 1, valueText: '$250,000', value: 250000 },
        { rank: 2, label: '2nd Prize', match: 5, winners: 10, valueText: '$10,000', value: 10000 },
        { rank: 3, label: '3rd Prize', match: 4, winners: 100, valueText: '$1,000', value: 1000 },
        { rank: 4, label: 'Drought Grant', match: 3, winners: 2000, valueText: '$100', value: 100 }
      ],
      draws: [
        { id: 'gippsland-d1', date: '2026-09-12', time: '6:00 pm AEST', status: 'drawn', sold: 49310,
          winningNumbers: [730004, 118402, 516330, 288471, 903117, 447200],
          published: '2026-09-12', source: 'demo', notes: 'Draw sheet lodged with the regulator the same evening.' }
      ]
    },
    {
      id: 'redlands',
      name: 'Redlands Community Hospice Appeal',
      charity: 'Redlands Community Hospice',
      state: 'QLD', region: 'Redlands & Logan',
      cause: 'Community palliative nursing and the family room wing',
      categories: ['cash', 'other'],
      headline: '$300,000 main prize + $50,000 building fund',
      price: 2, min: 1, max: 40,
      total: 90000, sold: 44200,
      open: '2026-05-01', close: '2026-10-09',
      drawTime: '1:00 pm AEST',
      odds: '1 in 2,100 per $2 ticket',
      dta: TICKET_REFS.QLD,
      enterUrl: 'https://example.org/redlands-hospice?ref=homelott',
      art: 'rose',
      supportLine: 'Nurses visit 1,900 people a year in their own homes, free of charge.',
      terms: [
        'One (1) prize of $300,000, one (1) prize of $50,000. Total prize pool $350,000.',
        '74% of gross sales fund hospice nursing hours.',
        'Draw conducted at the Redlands Performing Arts Centre.',
        'Must be 18 years or over to purchase. T&Cs of the Hospice apply.'
      ],
      tiers: [
        { rank: 1, label: 'Main Prize', match: 6, winners: 1, valueText: '$300,000', value: 300000 },
        { rank: 2, label: 'Building Fund Prize', match: 5, winners: 2, valueText: '$50,000', value: 50000 },
        { rank: 3, label: '3rd Prize', match: 4, winners: 25, valueText: '$2,000', value: 2000 },
        { rank: 4, label: 'Nursing Fund', match: 3, winners: 900, valueText: '$100', value: 100 }
      ],
      draws: [
        { id: 'redlands-d1', date: '2026-08-30', time: '1:00 pm AEST', status: 'drawn', sold: 40180,
          winningNumbers: [615882, 318447, 902115, 447712, 118402, 990021],
          published: '2026-08-30', source: 'demo', notes: 'Drawn with a retiring nurse drawing the final ball.' }
      ]
    },
    {
      id: 'maitland',
      name: 'Maitland Flood Relief Raffle',
      charity: 'Maitland Flood Relief Partnership',
      state: 'NSW', region: 'Hunter Valley',
      cause: 'Home repairs, dry-cleaning and mental health for flood-affected families',
      categories: ['home', 'cash'],
      headline: '$750,000 renovated home + $50,000 repair grant',
      price: 5, min: 1, max: 30,
      total: 60000, sold: 33220,
      open: '2026-07-01', close: '2026-10-16',
      drawTime: '3:00 pm AEST',
      odds: '1 in 1,100 per $5 ticket',
      dta: TICKET_REFS.NSW,
      enterUrl: 'https://example.org/maitland-flood-relief?ref=homelott',
      art: 'navy',
      supportLine: 'Rebuilds 12 homes a quarter, prioritising families with young children.',
      terms: [
        'One (1) prize: fully renovated $750,000 home, plus $50,000 cash repair grant.',
        'One (1) prize: $25,000. Total prize pool $825,000.',
        'Draw conducted at the Maitland Town Hall, under independent supervision.',
        'Must be 18 years or over to purchase. T&Cs of the Partnership apply.'
      ],
      tiers: [
        { rank: 1, label: '1st Prize', match: 6, winners: 1, valueText: '$750,000 home + $50,000', value: 800000 },
        { rank: 2, label: '2nd Prize', match: 5, winners: 3, valueText: '$25,000', value: 25000 },
        { rank: 3, label: '3rd Prize', match: 4, winners: 20, valueText: '$5,000', value: 5000 },
        { rank: 4, label: 'Repair Grant', match: 3, winners: 400, valueText: '$250', value: 250 }
      ],
      draws: [
        { id: 'maitland-d1', date: '2026-09-26', time: '3:00 pm AEST', status: 'drawn', sold: 30010,
          winningNumbers: [505616, 730004, 226540, 881026, 118402, 447003],
          published: '2026-09-26', source: 'demo', notes: 'Draw held at the rebuilt town hall — the first event in the new hall.' }
      ]
    },
    {
      id: 'coastwatch',
      name: 'Coastwatch Rescue Foundation Raffle',
      charity: 'Coastwatch Rescue Foundation',
      state: 'NSW', region: 'Central Coast & Newcastle',
      cause: 'Volunteer marine rescue, boat sheds and life-saving equipment',
      categories: ['home', 'cash'],
      headline: '$1,050,000 beachfront apartment + 5 x $100,000',
      price: 2, min: 1, max: 50,
      total: 120000, sold: 96410,
      open: '2026-06-15', close: '2026-10-05',
      drawTime: '5:00 pm AEST',
      odds: '1 in 2,800 per $2 ticket',
      dta: TICKET_REFS.NSW,
      enterUrl: 'https://example.org/coastwatch-rescue?ref=homelott',
      art: 'ocean',
      tag: 'Closing soon',
      supportLine: 'Volunteers give 31,000 hours a year to people in the water, free of charge.',
      terms: [
        'One (1) prize: $1,050,000 beachfront apartment package. Five (5) prizes of $100,000.',
        'Total prize pool $1,550,000. 71% of net sales fund rescue vessels and crew training.',
        'Draw conducted at the Coastwatch clubhouse, with televised draw.',
        'Must be 18 years or over to purchase. T&Cs of the Foundation apply.'
      ],
      tiers: [
        { rank: 1, label: '1st Prize', match: 6, winners: 1, valueText: '$1,050,000 apartment', value: 1050000 },
        { rank: 2, label: '2nd Prize', match: 5, winners: 5, valueText: '$100,000', value: 100000 },
        { rank: 3, label: '3rd Prize', match: 4, winners: 50, valueText: '$5,000', value: 5000 },
        { rank: 4, label: 'Crew Fund', match: 3, winners: 1500, valueText: '$200', value: 200 }
      ],
      draws: [
        { id: 'coastwatch-d1', date: '2026-10-05', time: '5:00 pm AEST', status: 'upcoming', sold: 96410, source: 'demo' }
      ]
    },
    {
      id: 'harbourview',
      name: 'Harbourview Home Dream',
      charity: "Brisbane Harbourview Youth Trust",
      state: 'QLD', region: 'Brisbane & Moreton Bay',
      cause: 'Youth housing, family violence shelters and youth workers',
      categories: ['home', 'cash'],
      headline: '$1,200,000 waterfront home + $250,000 cash',
      price: 10, min: 1, max: 20,
      total: 25000, sold: 18420,
      open: '2026-05-20', close: '2026-10-23',
      drawTime: '7:00 pm AEST',
      odds: '1 in 1,600 per $10 ticket',
      dta: TICKET_REFS.QLD,
      enterUrl: 'https://example.org/harbourview-home-dream?ref=homelott',
      art: 'sunset',
      supportLine: 'A $250,000 home for a young person leaving care, every year.',
      terms: [
        'One (1) prize: $1,200,000 waterfront home plus $250,000 cash. Total prize pool $1,450,000.',
        '63% of gross sales fund transitional youth housing.',
        'Draw conducted at the Brisbane Convention Centre, with livestream.',
        'Must be 18 years or over to purchase. T&Cs of the Trust apply.'
      ],
      tiers: [
        { rank: 1, label: '1st Prize', match: 6, winners: 1, valueText: '$1,200,000 home + $250,000', value: 1450000 },
        { rank: 2, label: '2nd Prize', match: 5, winners: 3, valueText: '$60,000', value: 60000 },
        { rank: 3, label: '3rd Prize', match: 4, winners: 15, valueText: '$10,000', value: 10000 },
        { rank: 4, label: 'Housing Fund', match: 3, winners: 250, valueText: '$500', value: 500 }
      ],
      draws: [
        { id: 'harbourview-d1', date: '2026-10-24', time: '7:00 pm AEST', status: 'upcoming', sold: 18420, source: 'demo' }
      ]
    },
    {
      id: 'fraser',
      name: 'Fraser Coast Home & Health Appeal',
      charity: 'Fraser Coast Home & Health Foundation',
      state: 'QLD', region: 'Fraser Coast',
      cause: 'Home hospital care, dialysis transport and rural health vans',
      categories: ['home', 'cash'],
      headline: '$950,000 house + $120,000 renovation prize',
      price: 1, min: 1, max: 100,
      total: 250000, sold: 141050,
      open: '2026-04-15', close: '2026-11-06',
      drawTime: '7:00 pm AEST',
      odds: '1 in 3,800 per $1 ticket',
      dta: TICKET_REFS.QLD,
      enterUrl: 'https://example.org/fraser-coast-home-health?ref=homelott',
      art: 'ocean',
      supportLine: 'The mobile health van drives 900 km a week to people who cannot get to a clinic.',
      terms: [
        'One (1) prize: $950,000 house. One (1) prize: $120,000 renovation package. Total prize pool $1,070,000.',
        '66% of net sales fund the mobile health van and home hospital program.',
        'Draw conducted at the Hervey Bay Community Centre.',
        'Must be 18 years or over to purchase. T&Cs of the Foundation apply.'
      ],
      tiers: [
        { rank: 1, label: '1st Prize', match: 6, winners: 1, valueText: '$950,000 house', value: 950000 },
        { rank: 2, label: '2nd Prize', match: 5, winners: 2, valueText: '$120,000 renovation', value: 120000 },
        { rank: 3, label: '3rd Prize', match: 4, winners: 40, valueText: '$5,000', value: 5000 },
        { rank: 4, label: 'Health Van Fund', match: 3, winners: 2000, valueText: '$250', value: 250 }
      ],
      draws: [
        { id: 'fraser-d1', date: '2026-11-07', time: '7:00 pm AEST', status: 'upcoming', sold: 141050, source: 'demo' }
      ]
    },
    {
      id: 'outback',
      name: 'Outback Roads 4x4 Fundraiser',
      charity: 'Outback Roads Assistance Network',
      state: 'NT', region: 'Alice Springs & Darwin',
      cause: 'Remote-area welfare checks and road crash first response',
      categories: ['car', 'cash'],
      headline: 'New 4WD utility + $50,000 cash + $30,000',
      price: 20, min: 1, max: 15,
      total: 8000, sold: 5140,
      open: '2026-07-15', close: '2026-11-13',
      drawTime: '2:00 pm ACST',
      odds: '1 in 700 per $20 ticket',
      dta: TICKET_REFS.NT,
      enterUrl: 'https://example.org/outback-roads-4x4?ref=homelott',
      art: 'gold',
      supportLine: 'Volunteers drive 40,000 km a year to check on people living alone in the bush.',
      terms: [
        'One (1) prize: new 4WD utility plus $50,000 cash. One (1) prize: $30,000. Total prize pool $164,000.',
        '69% of net sales fund vehicles, fuel and volunteer training.',
        'Draw conducted at the Alice Springs Civic Centre.',
        'Must be 18 years or over to purchase. T&Cs of the Network apply.'
      ],
      tiers: [
        { rank: 1, label: '1st Prize', match: 6, winners: 1, valueText: '4WD utility + $50,000', value: 114000 },
        { rank: 2, label: '2nd Prize', match: 5, winners: 2, valueText: '$30,000', value: 30000 },
        { rank: 3, label: '3rd Prize', match: 4, winners: 12, valueText: '$5,000', value: 5000 },
        { rank: 4, label: 'Fuel Fund', match: 3, winners: 200, valueText: '$300', value: 300 }
      ],
      draws: [
        { id: 'outback-d1', date: '2026-11-14', time: '2:00 pm ACST', status: 'upcoming', sold: 5140, source: 'demo' }
      ]
    },
    {
      id: 'barossa',
      name: 'Barossa Community Hospital Appeal',
      charity: 'Barossa Community Hospital Auxiliary',
      state: 'SA', region: 'Barossa & Angaston',
      cause: 'Emergency department equipment and a new outpatient wing',
      categories: ['home', 'cash', 'other'],
      headline: '$850,000 home + $100,000 + garden package',
      price: 5, min: 1, max: 40,
      total: 50000, sold: 19840,
      open: '2026-06-20', close: '2026-11-13',
      drawTime: '7:30 pm ACST',
      odds: '1 in 1,300 per $5 ticket',
      dta: TICKET_REFS.SA,
      enterUrl: 'https://example.org/barossa-hospital?ref=homelott',
      art: 'rose',
      supportLine: 'Funds a CT scanner that currently requires a 90-minute drive away.',
      terms: [
        'One (1) prize: $850,000 home. One (1) prize: $100,000 cash. One (1) prize: $35,000 garden package. Total prize pool $985,000.',
        '67% of net sales are directed to the hospital foundation.',
        'Draw conducted at the Tanunda Recreation Centre.',
        'Must be 18 years or over to purchase. T&Cs of the Auxiliary apply.'
      ],
      tiers: [
        { rank: 1, label: '1st Prize', match: 6, winners: 1, valueText: '$850,000 home', value: 850000 },
        { rank: 2, label: '2nd Prize', match: 5, winners: 2, valueText: '$100,000', value: 100000 },
        { rank: 3, label: '3rd Prize', match: 4, winners: 15, valueText: '$35,000 garden package', value: 35000 },
        { rank: 4, label: 'Equipment Fund', match: 3, winners: 400, valueText: '$250', value: 250 }
      ],
      draws: [
        { id: 'barossa-d1', date: '2026-11-14', time: '7:30 pm ACST', status: 'upcoming', sold: 19840, source: 'demo' }
      ]
    },
    {
      id: 'pinewood',
      name: "Pinewood Children's Trust Raffle",
      charity: "Pinewood Children's Trust",
      state: 'WA', region: 'Perth & Busselton',
      cause: "Foster care, kinship carers and children's hospital waiting rooms",
      categories: ['home', 'cash'],
      headline: '$1,400,000 family home + $200,000',
      price: 2, min: 1, max: 100,
      total: 200000, sold: 61520,
      open: '2026-07-01', close: '2026-12-18',
      drawTime: '7:00 pm AWST',
      odds: '1 in 3,600 per $2 ticket',
      dta: TICKET_REFS.WA,
      enterUrl: 'https://example.org/pinewood-childrens-trust?ref=homelott',
      art: 'leaf',
      supportLine: 'Every prize ticket funds one week of emergency foster care placements.',
      terms: [
        'One (1) prize: $1,400,000 family home plus $200,000 cash. Total prize pool $1,600,000.',
        '64% of gross sales support foster and kinship care programs.',
        'Draw conducted at the Perth Convention Centre, with livestream.',
        'Must be 18 years or over to purchase. T&Cs of the Trust apply.'
      ],
      tiers: [
        { rank: 1, label: '1st Prize', match: 6, winners: 1, valueText: '$1,400,000 home + $200,000', value: 1600000 },
        { rank: 2, label: '2nd Prize', match: 5, winners: 4, valueText: '$50,000', value: 50000 },
        { rank: 3, label: '3rd Prize', match: 4, winners: 30, valueText: '$5,000', value: 5000 },
        { rank: 4, label: 'Care Fund', match: 3, winners: 1200, valueText: '$250', value: 250 }
      ],
      draws: [
        { id: 'pinewood-d1', date: '2026-12-19', time: '7:00 pm AWST', status: 'upcoming', sold: 61520, source: 'demo' }
      ]
    },
    {
      id: 'ironrange',
      name: 'Iron Range Youth Foundation Draw',
      charity: 'Iron Range Youth Foundation',
      state: 'QLD', region: 'Cairns & Tablelands',
      cause: 'Youth mentoring, sport scholarships and remote school laptops',
      categories: ['cash', 'holiday'],
      headline: '$200,000 main prize + $25,000 + adventure holiday',
      price: 1, min: 1, max: 100,
      total: 200000, sold: 40210,
      open: '2026-08-01', close: '2026-12-24',
      drawTime: '7:00 pm AEST',
      odds: '1 in 2,700 per $1 ticket',
      dta: TICKET_REFS.QLD,
      enterUrl: 'https://example.org/iron-range-youth?ref=homelott',
      art: 'teal',
      supportLine: 'Sponsors 40 young people through school each year, sports and study.',
      terms: [
        'One (1) prize of $200,000, one (1) prize of $25,000, one (1) prize: $18,000 reef-and-rainforest holiday. Total prize pool $243,000.',
        '70% of net sales fund scholarships and mentoring.',
        'Draw conducted at the Tanks Arts Centre, Cairns.',
        'Must be 18 years or over to purchase. T&Cs of the Foundation apply.'
      ],
      tiers: [
        { rank: 1, label: 'Main Prize', match: 6, winners: 1, valueText: '$200,000', value: 200000 },
        { rank: 2, label: 'Runner Up', match: 5, winners: 3, valueText: '$25,000', value: 25000 },
        { rank: 3, label: '3rd Prize', match: 4, winners: 20, valueText: '$18,000 holiday', value: 18000 },
        { rank: 4, label: 'Scholarship', match: 3, winners: 1000, valueText: '$150', value: 150 }
      ],
      draws: [
        { id: 'ironrange-d1', date: '2026-12-25', time: '7:00 pm AEST', status: 'upcoming', sold: 40210, source: 'demo' }
      ]
    },
    {
      id: 'northernbeaches',
      name: 'Northern Beaches Community Trust Draw',
      charity: 'Northern Beaches Community Trust',
      state: 'NSW', region: 'Northern Beaches',
      cause: 'Lifeguards, surf lifesaving clubs and community surf craft',
      categories: ['car', 'cash', 'other'],
      headline: 'Dual-cockpit ute + $40,000 + surf ski package',
      price: 10, min: 1, max: 20,
      total: 15000, sold: 6210,
      open: '2026-08-15', close: '2026-12-11',
      drawTime: '6:00 pm AEST',
      odds: '1 in 520 per $10 ticket',
      dta: TICKET_REFS.NSW,
      enterUrl: 'https://example.org/northern-beaches-trust?ref=homelott',
      art: 'ocean',
      supportLine: 'Keeps 60 volunteer lifeguards on our beaches over summer.',
      terms: [
        'One (1) prize: dual-cockpit ute plus $40,000 cash. One (1) prize: $28,000 surf ski package. Total prize pool $128,000.',
        '72% of net sales fund patrol equipment and junior surf lifesaving.',
        'Draw conducted at the Manly Surf Pavilion.',
        'Must be 18 years or over to purchase. T&Cs of the Trust apply.'
      ],
      tiers: [
        { rank: 1, label: '1st Prize', match: 6, winners: 1, valueText: 'Ute + $40,000', value: 88000 },
        { rank: 2, label: '2nd Prize', match: 5, winners: 2, valueText: '$28,000 surf ski package', value: 28000 },
        { rank: 3, label: '3rd Prize', match: 4, winners: 10, valueText: '$3,000', value: 3000 },
        { rank: 4, label: 'Patrol Fund', match: 3, winners: 150, valueText: '$200', value: 200 }
      ],
      draws: [
        { id: 'northernbeaches-d1', date: '2026-12-12', time: '6:00 pm AEST', status: 'upcoming', sold: 6210, source: 'demo' }
      ]
    },
    {
      id: 'capitalcare',
      name: 'Capital City Home Hospital Appeal',
      charity: 'Capital City Home Hospital',
      state: 'ACT', region: 'Canberra & Queanbeyan',
      cause: 'Home hospital beds, nurse visits and equipment loans',
      categories: ['home', 'cash', 'other'],
      headline: '$680,000 townhouse + $80,000 + garden makeover',
      price: 1, min: 1, max: 100,
      total: 200000, sold: 41200,
      open: '2026-07-10', close: '2026-11-06',
      drawTime: '7:00 pm AEST',
      odds: '1 in 3,200 per $1 ticket',
      dta: TICKET_REFS.ACT,
      enterUrl: 'https://example.org/capital-city-home-hospital?ref=homelott',
      art: 'navy',
      supportLine: 'Home hospital lets 1 in 3 patients skip a hospital admission entirely.',
      terms: [
        'One (1) prize: $680,000 townhouse. One (1) prize: $80,000. One (1) prize: $22,000 garden makeover. Total prize pool $782,000.',
        '68% of net sales fund home hospital services.',
        'Draw conducted at the Canberra Services Club.',
        'Must be 18 years or over to purchase. T&Cs of the Hospital apply.'
      ],
      tiers: [
        { rank: 1, label: '1st Prize', match: 6, winners: 1, valueText: '$680,000 townhouse', value: 680000 },
        { rank: 2, label: '2nd Prize', match: 5, winners: 2, valueText: '$80,000', value: 80000 },
        { rank: 3, label: '3rd Prize', match: 4, winners: 18, valueText: '$22,000 garden makeover', value: 22000 },
        { rank: 4, label: 'Nursing Fund', match: 3, winners: 900, valueText: '$200', value: 200 }
      ],
      draws: [
        { id: 'capitalcare-d1', date: '2026-11-07', time: '7:00 pm AEST', status: 'upcoming', sold: 41200, source: 'demo' }
      ]
    }
  ];

  // ---- demo tickets -----------------------------------------------------
  // A small, fictional portfolio. `demo: true` marks it as sample data so it
  // can be filtered out or cleared without touching real entries.
  var DEMO_TICKETS = [
    { id: 't-1001', demo: true, lotteryId: 'riverina', drawId: 'riverina-d1', number: '903117',
      quantity: 10, unitPrice: 1, purchased: '2026-06-02', retailer: 'Riverina Community Newsagency, Wagga Wagga',
      checked: true, won: true, prizeRank: 1, prizeText: '$1,000,000 cash', prizeValue: 1000000,
      note: 'Won the million. Photo of the draw sheet in the filing cabinet.' },

    { id: 't-1002', demo: true, lotteryId: 'sunshine', drawId: 'sunshine-d1', number: '118402',
      quantity: 50, unitPrice: 2, purchased: '2026-05-19', retailer: 'Coolum Fair News, Sunshine Coast',
      checked: true, won: true, prizeRank: 2, prizeText: '$5,000', prizeValue: 5000,
      note: '' },

    { id: 't-1003', demo: true, lotteryId: 'sunshine', drawId: 'sunshine-d1', number: '402551',
      quantity: 20, unitPrice: 2, purchased: '2026-05-19', retailer: 'Coolum Fair News, Sunshine Coast',
      checked: true, won: false, note: 'Nothing. Good luck next time.' },

    { id: 't-1004', demo: true, lotteryId: 'tasman', drawId: 'tasman-d1', number: '550128',
      quantity: 100, unitPrice: 1, purchased: '2026-06-04', retailer: 'Hobart L&L Newsagency',
      checked: true, won: true, prizeRank: 4, prizeText: '$200 habitat grant', prizeValue: 200,
      note: '' },

    { id: 't-1005', demo: true, lotteryId: 'southerncross', drawId: 'southerncross-d1', number: '220417',
      quantity: 1, unitPrice: 5, purchased: '2026-04-28', retailer: 'Prahran Foodworks',
      checked: true, won: true, prizeRank: 2, prizeText: '$20,000', prizeValue: 20000,
      note: 'Single ticket. Best return rate in the household.' },

    { id: 't-1006', demo: true, lotteryId: 'gippsland', drawId: 'gippsland-d1', number: '730004',
      quantity: 100, unitPrice: 2, purchased: '2026-06-12', retailer: 'Sale Valley Newsagency',
      checked: false, note: '' },

    { id: 't-1007', demo: true, lotteryId: 'redlands', drawId: 'redlands-d1', number: '615880',
      quantity: 30, unitPrice: 2, purchased: '2026-05-08', retailer: 'Redland Bay News & Post',
      checked: true, won: false, note: '' },

    { id: 't-1008', demo: true, lotteryId: 'maitland', drawId: 'maitland-d1', number: '505616',
      quantity: 20, unitPrice: 5, purchased: '2026-07-15', retailer: 'Maitland Mercury Agency',
      checked: false, note: 'Results published 26 Sept — still to check.' },

    { id: 't-1009', demo: true, lotteryId: 'coastwatch', drawId: 'coastwatch-d1', number: '664211',
      quantity: 25, unitPrice: 2, purchased: '2026-09-12', retailer: 'Gosford Lotto Kiosk',
      checked: false, note: '' },

    { id: 't-1010', demo: true, lotteryId: 'pinewood', drawId: 'pinewood-d1', number: '341208',
      quantity: 50, unitPrice: 2, purchased: '2026-08-09', retailer: 'Busselton Coastal News',
      checked: false, note: 'Christmas draw.' },

    { id: 't-1011', demo: true, lotteryId: 'outback', drawId: 'outback-d1', number: '780431',
      quantity: 5, unitPrice: 20, purchased: '2026-08-18', retailer: 'Alice Springs Outback Stores',
      checked: false, note: '' },

    { id: 't-1012', demo: true, lotteryId: 'tasman', drawId: 'tasman-d1', number: '991204',
      quantity: 200, unitPrice: 1, purchased: '2026-06-04', retailer: 'Hobart L&L Newsagency',
      checked: false, note: '' }
  ];

  // ---- index ------------------------------------------------------------
  var lotteryById = {};
  LOTTERIES.forEach(function (l) {
    l.draws.forEach(function (d) { d.lotteryId = l.id; });
    l.mainDraw = l.draws[0];
    lotteryById[l.id] = l;
  });

  var drawIndex = {};
  LOTTERIES.forEach(function (l) {
    l.draws.forEach(function (d) { drawIndex[d.id] = d; });
  });

  global.HL = {
    brand: {
      name: 'Home Lotts',
      domain: 'thehomelott.com',
      email: 'hello@thehomelott.com',
      abn: '00 000 000 000',
      address: 'PO Box 4417, Surfers Paradise QLD 4217',
      abnNote: 'Placeholder details — replace before launch.'
    },
    states: STATES,
    categories: CATEGORIES,
    lotteries: LOTTERIES,
    demoTickets: DEMO_TICKETS,
    getLottery: function (id) { return lotteryById[id] || null; },
    getDraw: function (id) { return drawIndex[id] || null; },
    // every draw in the catalogue, newest first
    allDraws: function () {
      var out = [];
      LOTTERIES.forEach(function (l) { l.draws.forEach(function (d) { out.push(d); }); });
      out.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
      return out;
    },
    // the draw you would enter next for a lottery (soonest upcoming)
    nextDraw: function (lotteryId) {
      var l = lotteryById[lotteryId];
      if (!l) return null;
      var up = l.draws.filter(function (d) { return d.status !== 'drawn'; });
      up.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
      return up[0] || l.mainDraw;
    }
  };
})(window);
