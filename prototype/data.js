/* GoNarra V7 review fixtures. Scripts are original editorial drafts, not published guides.
 * Coordinates, durations and templates are illustrative; no verified hours, prices or live routes.
 */
var GN_DATA = {
  version: '7.0-review',
  contentRevision: '2026-10-22-draft-1',
  language: 'en',
  reviewedAt: '2026-10-22',
  contentStatus: 'Editorial draft — factual, English and pronunciation review pending',
  narrationLabel: 'Synthetic narration preview — not reviewed for public release',
  imageRights: 'Inherited V6 assets; original provenance and public/commercial rights unverified',
  places: {
    cathedral: {
      id: 'cathedral', name: 'Da Nang Cathedral', localName: 'Nhà thờ Chính tòa Đà Nẵng',
      category: 'Culture', tags: ['culture', 'architecture', 'city', 'history'],
      image: 'assets/cathedral.png', duration: 40, minDuration: 20,
      description: 'A city-centre church with Gothic architectural details and the familiar rooster nickname.',
      story: {
        id: 'cathedral-story', title: 'The story behind the rooster',
        script: 'Da Nang Cathedral is also known locally as the Rooster Church. The name comes from the rooster figure on its roof, rather than from a separate building. The city tourism portal connects that symbol with the Gospel story of Saint Peter and the idea of repentance. It describes the architecture as Gothic, with tall lines and pointed openings. These details offer a way to read the building beyond a quick photograph. This is a religious place as well as a sightseeing stop. Take a quiet moment to consider how a familiar city landmark can hold different meanings for a visitor and for a worshipper. Follow the site’s instructions during your visit.',
        sourceIds: ['cathedral-tourism'], audio: 'assets/audio/cathedral.wav',
        status: 'Draft script — synthetic preview only'
      },
      questions: [
        { q: 'Why is it called the Rooster Church?', a: 'The nickname refers to the rooster figure on its roof. The tourism portal connects it with Saint Peter and repentance.', sourceIds: ['cathedral-tourism'] },
        { q: 'What architectural style is described?', a: 'The city tourism portal describes the church as Gothic.', sourceIds: ['cathedral-tourism'] }
      ],
      sources: [{ id: 'cathedral-tourism', title: 'Da Nang Tourism Promotion Center — Nhà thờ giáo xứ Chính tòa Đà Nẵng (15 September 2015)', url: 'https://danangfantasticity.com/en/nha-tho-giao-xu-chanh-toa-da-nang-vn', sourceLanguage: 'vi', accessedAt: '2026-10-22' }],
      coordinates: { lat: 16.0676, lng: 108.2208 }, coordinateStatus: 'Approximate demo point; entrance not field-verified'
    },
    museum: {
      id: 'museum', name: 'Museum of Cham Sculpture', localName: 'Bảo tàng Điêu khắc Chăm Đà Nẵng',
      category: 'Culture', tags: ['culture', 'history', 'museum', 'indoor'],
      image: 'assets/museum.png', duration: 75, minDuration: 45,
      description: 'A museum introduction to the sculpture and cultural heritage of Champa.',
      story: {
        id: 'museum-story', title: 'Sculptures with a longer journey',
        script: 'The Museum of Cham Sculpture brings together objects whose stories extend beyond this building. According to the city tourism portal, sculptures were gathered from Da Nang, Quang Nam and neighbouring areas in the late nineteenth century. The first museum building began construction in 1915 and opened to the public in 1919. Its design drew on features of Cham temples. The museum later expanded, with galleries bearing names such as My Son and Tra Kieu. Those names connect the collection with places of origin. Rather than trying to see everything at once, choose a small number of objects and read their labels. Notice the place names: they can help turn individual sculptures into part of a wider cultural landscape.',
        sourceIds: ['museum-tourism'], audio: 'assets/audio/museum.wav',
        status: 'Draft script — synthetic preview only'
      },
      questions: [
        { q: 'When did the museum open to the public?', a: 'The city tourism portal records its public opening in 1919.', sourceIds: ['museum-tourism'] },
        { q: 'Why do the gallery names matter?', a: 'Names such as My Son and Tra Kieu connect the collection with its places of origin.', sourceIds: ['museum-tourism'] }
      ],
      sources: [{ id: 'museum-tourism', title: 'Da Nang Tourism Promotion Center — Museum of Cham Sculpture (7 September 2020)', url: 'https://danangfantasticity.com/en/danang-museum-of-cham-sculpture/overview-da-nang-museum-of-cham-sculpture', sourceLanguage: 'en', accessedAt: '2026-10-22' }],
      coordinates: { lat: 16.0602, lng: 108.2233 }, coordinateStatus: 'Approximate demo point; entrance not field-verified'
    },
    lunch: {
      id: 'lunch', name: 'Lunch & rest break', localName: 'Nghỉ ăn trưa',
      category: 'Break', tags: ['food', 'rest', 'break'], image: 'assets/coast.png',
      duration: 60, minDuration: 30,
      description: 'An unbooked break near your previous stop. Choose a venue yourself; no restaurant is reserved or recommended.',
      story: { id: 'lunch-break', title: 'Make room for a pause', script: '', sourceIds: [], audio: null, status: 'Break placeholder — no recorded story' },
      questions: [{ q: 'Is a restaurant booked?', a: 'No. This is a flexible break in the demo plan, not a named venue or booking.', sourceIds: [] }],
      sources: [], coordinates: null, coordinateStatus: 'No venue selected; break stays at previous location', isBreak: true
    },
    beach: {
      id: 'beach', name: 'My Khe Beach', localName: 'Biển Mỹ Khê',
      category: 'Beach', tags: ['beach', 'coast', 'relax', 'nature'], image: 'assets/beach.png',
      duration: 75, minDuration: 30,
      description: 'A coastal pause that connects a city visit with the sea.',
      story: {
        id: 'beach-story', title: 'Where the city meets the coast',
        script: 'My Khe is part of Da Nang’s everyday coastal life, close to the city rather than a separate island escape. The city tourism portal describes a place shared by visitors and residents, with walking, exercise and time beside the sea shaping its daily rhythm. A beach stop can be a pause in a busy itinerary, without needing another attraction to complete. Leave a few minutes unplanned: listen to the water, rest, or take a short walk if conditions permit. This recording does not assess today’s sea conditions or confirm that swimming is permitted. Check the instructions at the beach and decide what suits the conditions and your energy. A quieter stop is still part of the journey.',
        sourceIds: ['beach-tourism'], audio: 'assets/audio/beach.wav',
        status: 'Draft script — synthetic preview only'
      },
      questions: [
        { q: 'Do I have to swim to enjoy this stop?', a: 'No. The tourism portal also describes walks, exercise and simply spending time beside the sea.', sourceIds: ['beach-tourism'] },
        { q: 'Does this app know today’s swimming conditions?', a: 'No. This prototype has no live beach-safety information. Check instructions at the beach.', sourceIds: [] }
      ],
      sources: [{ id: 'beach-tourism', title: 'Da Nang Tourism Promotion Center — Enjoy Da Nang at Two Beaches (13 July 2026)', url: 'https://danangfantasticity.com/en/enjoy-da-nang-at-two-beaches-named-among-lonely-planets-10-best-beaches-in-vietnam', sourceLanguage: 'en', accessedAt: '2026-10-22' }],
      coordinates: { lat: 16.0544, lng: 108.2476 }, coordinateStatus: 'Approximate demo beach point; safe access not field-verified'
    },
    mountain: {
      id: 'mountain', name: 'Marble Mountains', localName: 'Ngũ Hành Sơn',
      category: 'Nature', tags: ['nature', 'culture', 'history', 'stairs', 'outdoor'], image: 'assets/mountain.png',
      duration: 120, minDuration: 60,
      description: 'A landscape of limestone peaks, caves and religious sites; a visit may involve substantial climbing.',
      story: {
        id: 'mountain-story', title: 'Five names in the landscape',
        script: 'The name Ngu Hanh Son connects these limestone peaks with five elements: metal, water, wood, fire and earth. Vietnam’s tourism authority describes a landscape of caves, pagodas and spiritual significance. Treat this as an introduction, rather than directions through the site. Choose a route that suits your mobility and the conditions, and follow local instructions.',
        sourceIds: ['mountain-vnat'], audio: 'assets/audio/mountain.wav', status: 'Short draft introduction — synthetic preview only'
      },
      questions: [
        { q: 'What does Ngu Hanh Son refer to?', a: 'The five peaks are named after metal, water, wood, fire and earth.', sourceIds: ['mountain-vnat'] },
        { q: 'Is this a step-free visit?', a: 'The official tourism introduction describes extensive uphill walking and steps. This prototype has no verified accessible route.', sourceIds: ['mountain-vnat'] }
      ],
      sources: [{ id: 'mountain-vnat', title: 'Viet Nam National Authority of Tourism — A walk around Marble Mountains', url: 'https://vietnam.travel/things-to-do/around-marble-mountains', sourceLanguage: 'en', accessedAt: '2026-10-22' }],
      coordinates: { lat: 16.0038, lng: 108.2631 }, coordinateStatus: 'Approximate demo point; entrance and accessible route not verified'
    },
    bridge: {
      id: 'bridge', name: 'Dragon Bridge riverside', localName: 'Khu vực ven sông Cầu Rồng',
      category: 'Culture', tags: ['culture', 'architecture', 'river', 'relax'], image: 'assets/coast.png',
      duration: 30, minDuration: 15,
      description: 'A short riverside stop to learn about the bridge’s design; no performance is promised.',
      story: {
        id: 'bridge-story', title: 'A dragon across the river',
        script: 'Dragon Bridge is both a transport link and an architectural landmark. WSP’s project account describes a six-lane bridge shaped after a dragon of the Ly dynasty, opened in March 2013. The structure can produce fire and water effects, but this guide does not confirm a performance today. Enjoy the bridge from a suitable public viewing area and follow local access instructions.',
        sourceIds: ['bridge-wsp'], audio: 'assets/audio/bridge.wav', status: 'Short draft introduction — synthetic preview only'
      },
      questions: [
        { q: 'What inspired the dragon shape?', a: 'The project account describes a dragon of the Ly dynasty.', sourceIds: ['bridge-wsp'] },
        { q: 'Will there be a fire show today?', a: 'This prototype does not verify current performance schedules. Check an official current announcement before planning around a show.', sourceIds: [] }
      ],
      sources: [{ id: 'bridge-wsp', title: 'WSP — Fire-breathing Dragon Bridge, Vietnam', url: 'https://www.wsp.com/en-gb/projects/fire-breathing-dragon-bridge-vietnam', sourceLanguage: 'en', accessedAt: '2026-10-22' }],
      coordinates: { lat: 16.0603, lng: 108.2246 }, coordinateStatus: 'Approximate riverside demo point, not the bridge deck; safe access not field-verified'
    }
  },
  templates: [
    {
      id: 'river-coast', title: 'From river to coast', subtitle: 'City culture, a pause, then the beach',
      image: 'assets/coast.png', description: 'A prepared review itinerary with two cultural stops, a flexible lunch break and time by the sea. Travel times are demo estimates; opening hours are not checked.',
      stops: [{ id: 'cathedral', duration: 40 }, { id: 'museum', duration: 75 }, { id: 'lunch', duration: 60 }, { id: 'beach', duration: 75 }],
      status: 'Prepared demo tour — not field-validated', mode: 'car'
    },
    {
      id: 'slow-coast', title: 'A slower coastal afternoon', subtitle: 'Fewer stops, more breathing room',
      image: 'assets/beach.png', description: 'A lighter prepared plan: beach time, a flexible break and a riverside stop. No swimming conditions or bridge performance are confirmed.',
      stops: [{ id: 'beach', duration: 75 }, { id: 'lunch', duration: 60 }, { id: 'bridge', duration: 30 }],
      status: 'Prepared demo tour — not field-validated', mode: 'car'
    }
  ]
};
if (typeof window !== 'undefined') window.GN_DATA = GN_DATA;
if (typeof module !== 'undefined' && module.exports) module.exports = GN_DATA;
