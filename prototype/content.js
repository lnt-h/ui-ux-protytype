/* Original GoNarra editorial companion to GN_DATA. No runtime API calls.
 * Stable historical facts have primary-source references. Visit rhythms,
 * collections and tour suitability are editorial suggestions, not live advice.
 * Unknown operational data is explicit; never use it to validate a route.
 */
var GN_CONTENT = {
  revision: '2026-10-23-rich-content-1',
  checkedAt: '2026-10-23',
  status: 'Editorial companion — route and access checks still required',
  places: {
    cathedral: {
      shortHook: 'Look up for the rooster. Stay for the Gothic details.',
      setting: 'mixed',
      tags: ['Architecture', 'Heritage', 'Quiet stop'],
      highlights: [
        { title: 'A familiar nickname', text: 'The rooftop rooster gives the church its local nickname.', sourceIds: ['cathedral-tourism'] },
        { title: 'Read the architecture', text: 'The tourism portal identifies Gothic design, with soaring lines and pointed openings.', sourceIds: ['cathedral-tourism'] },
        { title: 'More than a photo', text: 'The rooster is linked to Saint Peter and repentance in the parish explanation.', sourceIds: ['cathedral-tourism'] }
      ],
      visitRhythm: [
        { title: 'First, take it in', text: 'Find a permitted place to pause and look at the roofline.' },
        { title: 'Then, listen closely', text: 'Play the short story before looking again at the rooster and windows.' },
        { title: 'Leave room to linger', text: 'Use the rest of your planned time for quiet observation, where access allows.' }
      ],
      visitTips: ['Use headphones at a low volume.', 'Check on-site visitor instructions before entering.', 'Keep your visit flexible around worship.'],
      practicalFacts: [
        { label: 'Built', value: '1923, according to the city tourism portal', status: 'sourced', sourceIds: ['cathedral-tourism'] },
        { label: 'Suggested stop', value: '40 min · editable planning estimate', status: 'editorial', sourceIds: [] },
        { label: 'Visitor hours & admission', value: 'Not verified in this prototype', status: 'unknown', sourceIds: [] },
        { label: 'Entrance & step-free access', value: 'Confirm with the venue', status: 'unknown', sourceIds: [] }
      ],
      etiquette: ['This is a place of worship: keep voices quiet and follow photography instructions.'],
      mobility: ['The demo map point is approximate. Confirm the entrance and accessible route before travelling.'],
      audioTakeaways: ['What the rooster nickname means', 'How to notice the Gothic details', 'Why the building matters to worshippers as well as visitors'],
      sourceIds: ['cathedral-tourism']
    },
    museum: {
      shortHook: 'Follow a sculpture back to the place it came from.',
      setting: 'indoor',
      tags: ['Museum', 'Champa heritage', 'Slower looking'],
      highlights: [
        { title: 'A collection with roots', text: 'The collection grew from sculptures gathered across Da Nang, Quang Nam and nearby provinces.', sourceIds: ['museum-tourism'] },
        { title: 'A century of visitors', text: 'The first building opened to the public in 1919.', sourceIds: ['museum-tourism'] },
        { title: 'Places inside the galleries', text: 'Gallery names such as My Son and Tra Kieu connect the objects with their origins.', sourceIds: ['museum-tourism'] }
      ],
      visitRhythm: [
        { title: 'Get your bearings', text: 'Look at the available gallery information before choosing where to begin.' },
        { title: 'Choose a few objects', text: 'Spend time with several sculptures rather than rushing through every room.' },
        { title: 'Connect the names', text: 'Read a label, notice its place of origin, then compare another object.' }
      ],
      visitTips: ['Take a listening break before moving between galleries.', 'Use the object labels alongside the story.', 'Keep time for an unhurried final look.'],
      practicalFacts: [
        { label: 'Public opening', value: '1919', status: 'sourced', sourceIds: ['museum-tourism'] },
        { label: 'Suggested stop', value: '75 min · editable planning estimate', status: 'editorial', sourceIds: [] },
        { label: 'Opening hours & tickets', value: 'Check current venue information', status: 'unknown', sourceIds: [] },
        { label: 'Access & facilities', value: 'Step-free route and facilities not verified', status: 'unknown', sourceIds: [] }
      ],
      etiquette: ['Follow the museum’s photography rules and keep clear of displays.'],
      mobility: ['An indoor visit does not guarantee step-free access. Ask the venue about the route you need.'],
      audioTakeaways: ['How the collection began', 'Why 1919 is a key date', 'What the gallery place names reveal'],
      sourceIds: ['museum-tourism']
    },
    beach: {
      shortHook: 'A coastal pause, with no checklist to finish.',
      setting: 'outdoor',
      tags: ['Coast', 'Open air', 'Unhurried'],
      highlights: [
        { title: 'City meets the sea', text: 'The city tourism portal describes My Khe as a beach close to central Da Nang.', sourceIds: ['beach-tourism'] },
        { title: 'An everyday rhythm', text: 'Walks and morning exercise form part of the beach’s local life.', sourceIds: ['beach-tourism'] },
        { title: 'Choose your own pause', text: 'A short walk or time beside the water can be the whole experience.', sourceIds: [] }
      ],
      visitRhythm: [
        { title: 'Check the conditions', text: 'Read local signs and choose an appropriate public access point.' },
        { title: 'Find your pace', text: 'Walk a little, listen to the story or sit and watch the sea.' },
        { title: 'Keep a little spare time', text: 'Allow space to rest before continuing your trip.' }
      ],
      visitTips: ['Bring water and suitable sun protection.', 'You do not need to swim to enjoy this stop.', 'Check local instructions before any activity in the water.'],
      practicalFacts: [
        { label: 'Suggested stop', value: '75 min · editable planning estimate', status: 'editorial', sourceIds: [] },
        { label: 'Sea & swimming conditions', value: 'No live beach-safety feed', status: 'unknown', sourceIds: [] },
        { label: 'Access & facilities', value: 'Specific entrance and facilities not verified', status: 'unknown', sourceIds: [] }
      ],
      etiquette: ['Take litter with you and leave shared public space clear.'],
      mobility: ['Sand and waterfront access can affect a visit. Choose a route that suits your mobility.'],
      audioTakeaways: ['How the beach fits into city life', 'Ways to enjoy a stop without swimming', 'Why leaving time unplanned can be worthwhile'],
      sourceIds: ['beach-tourism']
    },
    mountain: {
      shortHook: 'Limestone peaks, cave spaces and a spiritual landscape.',
      setting: 'outdoor',
      tags: ['Nature', 'Caves & pagodas', 'Climbing'],
      highlights: [
        { title: 'Five elements', text: 'Ngu Hanh Son names five peaks for metal, water, wood, fire and earth.', sourceIds: ['mountain-vnat'] },
        { title: 'Nature and belief', text: 'The official tourism introduction describes caves, shrines and pagodas within the landscape.', sourceIds: ['mountain-vnat'] },
        { title: 'A more active visit', text: 'Stone steps and uphill walking are part of the visit described by the tourism authority.', sourceIds: ['mountain-vnat'] }
      ],
      visitRhythm: [
        { title: 'Choose a manageable route', text: 'Check current access information before deciding how much to explore.' },
        { title: 'Pause before climbing', text: 'Listen to the introduction while stationary, then put your attention on the path.' },
        { title: 'Adapt as you go', text: 'Use fewer stops and more rest time if the route or conditions require it.' }
      ],
      visitTips: ['Wear walking shoes; carry water and sun protection.', 'Allow for uphill walking and take breaks.', 'Confirm current access before choosing a route.'],
      practicalFacts: [
        { label: 'Landscape', value: 'Five limestone peaks', status: 'sourced', sourceIds: ['mountain-vnat'] },
        { label: 'Suggested stop', value: '120 min · editable planning estimate', status: 'editorial', sourceIds: [] },
        { label: 'Hours, tickets & elevator', value: 'Current availability not verified', status: 'unknown', sourceIds: [] },
        { label: 'Step-free route', value: 'Not verified; substantial steps are described', status: 'unknown', sourceIds: ['mountain-vnat'] }
      ],
      etiquette: ['Dress modestly at spiritual sites and follow local instructions when entering pagodas.'],
      mobility: ['This is an active visit with steps. Do not infer an accessible route from the map marker.'],
      audioTakeaways: ['What the five names represent', 'How nature and spiritual sites share the landscape', 'Why route choice should match your mobility'],
      sourceIds: ['mountain-vnat']
    },
    bridge: {
      shortHook: 'Read the dragon’s shape from the riverside.',
      setting: 'outdoor',
      tags: ['River', 'Architecture', 'Short stop'],
      highlights: [
        { title: 'A dragon in the structure', text: 'WSP describes a design inspired by a dragon of the Ly dynasty.', sourceIds: ['bridge-wsp'] },
        { title: 'A working city link', text: 'The six-lane bridge opened in March 2013.', sourceIds: ['bridge-wsp'] },
        { title: 'More than a spectacle', text: 'Notice the bridge’s form and connection across the Han River, even without a performance.', sourceIds: ['bridge-wsp'] }
      ],
      visitRhythm: [
        { title: 'Find a suitable pause', text: 'Choose an accessible public viewing place away from traffic.' },
        { title: 'Trace the silhouette', text: 'Listen to the short introduction, then look along the dragon-shaped structure.' },
        { title: 'Enjoy the river', text: 'Leave a few moments to take in the riverside before your next stop.' }
      ],
      visitTips: ['Pause audio when crossing roads.', 'Treat a performance as a separate plan requiring a current announcement.', 'Keep your viewing point clear of traffic and access routes.'],
      practicalFacts: [
        { label: 'Opened', value: 'March 2013', status: 'sourced', sourceIds: ['bridge-wsp'] },
        { label: 'Suggested stop', value: '30 min · editable planning estimate', status: 'editorial', sourceIds: [] },
        { label: 'Fire & water performance', value: 'Today’s schedule is not confirmed', status: 'unknown', sourceIds: [] },
        { label: 'Viewing point', value: 'Demo riverside point; safe access not verified', status: 'unknown', sourceIds: [] }
      ],
      etiquette: ['Keep public paths and viewing areas clear for others.'],
      mobility: ['Check crossings, kerbs and the viewing area locally; this prototype has no verified accessible route.'],
      audioTakeaways: ['The inspiration behind the dragon shape', 'The bridge’s transport role', 'Why the guide does not promise a show'],
      sourceIds: ['bridge-wsp']
    },
    lunch: {
      shortHook: 'Make room for food, water and a slower moment.',
      setting: 'flexible',
      tags: ['Flexible break', 'Choose your venue'],
      highlights: [
        { title: 'Your choice of venue', text: 'Choose somewhere that suits your preferences and access needs.', sourceIds: [] },
        { title: 'Time stays in the plan', text: 'A break helps keep the itinerary realistic without adding another attraction.', sourceIds: [] },
        { title: 'No reservation implied', text: 'This stop is a time allowance, with no restaurant selected or booked.', sourceIds: [] }
      ],
      visitRhythm: [
        { title: 'Choose locally', text: 'Check a venue and its menu before deciding.' },
        { title: 'Take your break', text: 'Use the time for food, water or simply rest.' },
        { title: 'Check what is next', text: 'Review the next stop before resuming your trip.' }
      ],
      visitTips: ['Check dietary needs directly with the venue.', 'Meal costs are not included or estimated.', 'Adjust the break duration to suit your day.'],
      practicalFacts: [
        { label: 'Suggested break', value: '60 min · editable planning estimate', status: 'editorial', sourceIds: [] },
        { label: 'Venue & booking', value: 'None selected', status: 'known', sourceIds: [] },
        { label: 'Location', value: 'Remains at the previous stop until you choose', status: 'known', sourceIds: [] }
      ],
      etiquette: [],
      mobility: ['Choose a venue and seating arrangement that match your access needs.'],
      audioTakeaways: [],
      sourceIds: []
    }
  },
  tours: {
    'river-coast': {
      shortHook: 'Architecture and sculpture, then room to unwind by the sea.',
      suitedFor: ['A first introduction to Da Nang', 'Culture with a coastal finish', 'Visitors who want a planned lunch break'],
      journeyHighlights: [
        { placeId: 'cathedral', title: 'Notice the city’s details', text: 'Start with the rooster story and the cathedral’s architecture.' },
        { placeId: 'museum', title: 'Follow the heritage', text: 'Use gallery names to connect sculptures with a wider landscape.' },
        { placeId: 'lunch', title: 'Make time to pause', text: 'Choose your own venue and keep the break flexible.' },
        { placeId: 'beach', title: 'Change the rhythm', text: 'Finish with an unhurried coastal stop.' }
      ],
      included: ['An editable four-stop itinerary', 'Three English synthetic story previews', 'Story transcripts and source links', 'Audio and information download option'],
      notIncluded: ['Transport, admission or meals', 'A guide, reservation or booking', 'Live route validation or sea-safety information'],
      startNote: 'The prepared plan begins from the demo city starting point. Check and change your starting point before travelling.',
      endNote: 'The final planned stop is My Khe Beach. The itinerary does not include a return transfer.',
      planningNote: 'Stop durations and transfers are estimates. A planned finish is not a verified arrival promise.',
      sourceIds: ['cathedral-tourism', 'museum-tourism', 'beach-tourism']
    },
    'slow-coast': {
      shortHook: 'Fewer stops, with space for the coast and the river.',
      suitedFor: ['A lighter, flexible outing', 'Coastal time without a long attraction list', 'Visitors who prefer more breathing room'],
      journeyHighlights: [
        { placeId: 'beach', title: 'Begin beside the sea', text: 'Walk, listen or sit for a while, as local conditions allow.' },
        { placeId: 'lunch', title: 'Keep a generous pause', text: 'Make a local choice for food and rest.' },
        { placeId: 'bridge', title: 'Finish by the river', text: 'Learn about the dragon-shaped bridge without relying on a show.' }
      ],
      included: ['An editable three-stop itinerary', 'Two English synthetic story previews', 'Story transcripts and source links', 'Audio and information download option'],
      notIncluded: ['Transport, admission or meals', 'A restaurant reservation', 'Water activities or a confirmed bridge performance'],
      startNote: 'Choose how to reach My Khe Beach from your starting point. The prototype does not verify today’s journey.',
      endNote: 'The final planned stop is the Dragon Bridge riverside. A return journey can be added in the planner.',
      planningNote: 'The tour name describes its editorial mood. Its start time remains editable; no afternoon event is booked.',
      sourceIds: ['beach-tourism', 'bridge-wsp']
    }
  },
  collections: [
    { id: 'culture', title: 'Read the city', subtitle: 'Architecture, sculpture and stories behind familiar landmarks', placeIds: ['cathedral', 'museum', 'bridge'], imagePlaceId: 'cathedral', icon: 'compass', accent: 'navy', editorial: true },
    { id: 'coast', title: 'A little more open air', subtitle: 'Coastal pauses and a more active mountain visit', placeIds: ['beach', 'mountain'], imagePlaceId: 'beach', icon: 'map', accent: 'sky', editorial: true },
    { id: 'shortbreak', title: 'Start with one story', subtitle: 'Shorter planned visits when you do not want a full tour', placeIds: ['bridge', 'cathedral'], imagePlaceId: 'bridge', icon: 'headphones', accent: 'teal', editorial: true }
  ],
  city: {
    name: 'Da Nang',
    localName: 'Đà Nẵng',
    timeZone: 'Asia/Ho_Chi_Minh',
    introduction: 'Build your day around city stories, cultural stops and time beside the sea.',
    tips: [
      { id: 'pause', title: 'Keep room for a pause', text: 'Leave time for water, food and rest instead of filling every minute.', icon: 'clock' },
      { id: 'listen', title: 'Listen when you can pause', text: 'Use a comfortable volume, and give crossings and steps your full attention.', icon: 'headphones' },
      { id: 'download', title: 'Prepare before heading out', text: 'Save story audio and information while connected. Map routing still needs a connection.', icon: 'download' },
      { id: 'access', title: 'Choose a route that suits you', text: 'Check local access, weather and venue information before setting off.', icon: 'compass' }
    ],
    planningPrompts: [
      { label: 'A first visit', prompt: 'Plan a balanced day with culture and time by the sea.' },
      { label: 'More time outside', prompt: 'Show me the coast and nature options.' },
      { label: 'A shorter day', prompt: 'Help me choose fewer stops with time to rest.' }
    ]
  },
  sources: {
    'cathedral-tourism': { title: 'Da Nang Tourism Promotion Center — Da Nang Cathedral', url: 'https://danangfantasticity.com/en/nha-tho-giao-xu-chanh-toa-da-nang-vn', publishedAt: '2015-09-15', checkedAt: '2026-10-23', scope: 'Historical background and architecture; no current visitor access confirmed' },
    'museum-tourism': { title: 'Da Nang Tourism Promotion Center — Museum of Cham Sculpture', url: 'https://danangfantasticity.com/en/danang-museum-of-cham-sculpture/overview-da-nang-museum-of-cham-sculpture', publishedAt: '2020-09-07', checkedAt: '2026-10-23', scope: 'Museum history and collection context; no current ticket or access information confirmed' },
    'beach-tourism': { title: 'Da Nang Tourism Promotion Center — Enjoy Da Nang at Two Beaches', url: 'https://danangfantasticity.com/en/enjoy-da-nang-at-two-beaches-named-among-lonely-planets-10-best-beaches-in-vietnam', publishedAt: '2026-07-13', checkedAt: '2026-10-23', scope: 'Coastal setting and everyday activities; no live weather or swimming conditions' },
    'mountain-vnat': { title: 'Viet Nam National Authority of Tourism — A walk around Marble Mountains', url: 'https://vietnam.travel/things-to-do/around-marble-mountains', checkedAt: '2026-10-23', scope: 'Landscape, steps and spiritual-site etiquette; published prices and hours are not treated as current verification' },
    'bridge-wsp': { title: 'WSP — Fire-breathing Dragon Bridge, Vietnam', url: 'https://www.wsp.com/en-gb/projects/fire-breathing-dragon-bridge-vietnam', checkedAt: '2026-10-23', scope: 'Project design and opening; no current performance schedule' }
  }
};
if (typeof window !== 'undefined') window.GN_CONTENT = GN_CONTENT;
if (typeof module !== 'undefined' && module.exports) module.exports = GN_CONTENT;
