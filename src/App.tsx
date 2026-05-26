import { useMemo, useState } from 'react'
import './App.css'
import { firebaseApp, firebaseProjectId } from './firebase'

// ─── Word Classification Data ────────────────────────────────────────────────

type WordType = { name: string; description: string; examples: string[] }
type PosCategory = { pos: string; label: string; color: string; types: WordType[] }

const posCategories: PosCategory[] = [
  {
    pos: 'noun',
    label: 'Noun',
    color: 'blue',
    types: [
      { name: 'Common noun', description: 'General names for people, places, or things.', examples: ['city', 'dog', 'teacher', 'book'] },
      { name: 'Proper noun', description: 'Specific names; always capitalised.', examples: ['London', 'Maria', 'Netflix', 'Monday'] },
      { name: 'Countable noun', description: 'Can be counted; has a plural form.', examples: ['apple → apples', 'idea → ideas', 'chair → chairs'] },
      { name: 'Uncountable noun', description: 'Cannot be counted; has no plural.', examples: ['water', 'advice', 'music', 'information'] },
      { name: 'Abstract noun', description: 'Names feelings, ideas, or qualities you cannot touch.', examples: ['freedom', 'happiness', 'courage', 'love'] },
      { name: 'Collective noun', description: 'Names a group of people or things as one unit.', examples: ['team', 'flock', 'audience', 'committee'] },
    ],
  },
  {
    pos: 'verb',
    label: 'Verb',
    color: 'green',
    types: [
      { name: 'Action verb', description: 'Describes a physical or mental action.', examples: ['run', 'think', 'write', 'decide'] },
      { name: 'Linking verb', description: 'Connects the subject to a description; no action.', examples: ['is / am / are', 'seem', 'feel', 'become'] },
      { name: 'Auxiliary (helping) verb', description: 'Works with a main verb to show tense or voice.', examples: ['have eaten', 'is walking', 'was told', 'will finish'] },
      { name: 'Modal verb', description: 'Expresses possibility, ability, obligation, or permission.', examples: ['can / could', 'may / might', 'must / should', 'will / would'] },
      { name: 'Transitive verb', description: 'Requires a direct object to complete its meaning.', examples: ['She read the book.', 'He kicked the ball.'] },
      { name: 'Intransitive verb', description: 'Does not need a direct object.', examples: ['The baby laughed.', 'Birds fly.', 'He arrived late.'] },
    ],
  },
  {
    pos: 'adjective',
    label: 'Adjective',
    color: 'orange',
    types: [
      { name: 'Descriptive adjective', description: 'Describes a quality or characteristic of the noun.', examples: ['beautiful', 'tall', 'cold', 'clever'] },
      { name: 'Quantitative adjective', description: 'Shows the quantity of the noun.', examples: ['some', 'many', 'few', 'a little', 'several'] },
      { name: 'Demonstrative adjective', description: 'Points to a specific noun.', examples: ['this', 'that', 'these', 'those'] },
      { name: 'Possessive adjective', description: 'Shows ownership.', examples: ['my', 'your', 'his', 'her', 'our', 'their'] },
      { name: 'Comparative adjective', description: 'Compares two nouns.', examples: ['bigger', 'more important', 'better', 'faster'] },
      { name: 'Superlative adjective', description: 'Compares one noun to all others in a group.', examples: ['the biggest', 'the most important', 'the best'] },
    ],
  },
  {
    pos: 'adverb',
    label: 'Adverb',
    color: 'purple',
    types: [
      { name: 'Adverb of manner', description: 'Describes how an action is done.', examples: ['quickly', 'carefully', 'well', 'slowly'] },
      { name: 'Adverb of time', description: 'Tells when an action happens.', examples: ['yesterday', 'soon', 'already', 'still', 'yet'] },
      { name: 'Adverb of place', description: 'Tells where an action happens.', examples: ['here', 'there', 'nearby', 'everywhere'] },
      { name: 'Adverb of frequency', description: 'Tells how often an action happens.', examples: ['always', 'usually', 'often', 'rarely', 'never'] },
      { name: 'Adverb of degree', description: 'Modifies adjectives or other adverbs by adding intensity.', examples: ['very', 'quite', 'rather', 'almost', 'too'] },
    ],
  },
  {
    pos: 'preposition',
    label: 'Preposition',
    color: 'teal',
    types: [
      { name: 'Preposition of place', description: 'Shows the location or position of something.', examples: ['in the box', 'on the table', 'under the bridge', 'between the buildings'] },
      { name: 'Preposition of time', description: 'Shows when something happens.', examples: ['at noon', 'on Monday', 'in April', 'during the meeting', 'for three hours'] },
      { name: 'Preposition of movement', description: 'Shows direction or movement.', examples: ['to the store', 'from school', 'into the room', 'across the street'] },
      { name: 'Preposition of manner', description: 'Shows the method or way something is done.', examples: ['by car', 'with care', 'in silence', 'without a map'] },
    ],
  },
  {
    pos: 'conjunction',
    label: 'Conjunction',
    color: 'red',
    types: [
      { name: 'Coordinating conjunction', description: 'Joins two equal parts (use FANBOYS to remember).', examples: ['for', 'and', 'nor', 'but', 'or', 'yet', 'so'] },
      { name: 'Subordinating conjunction', description: 'Connects a dependent clause to a main clause.', examples: ['because', 'although', 'since', 'while', 'unless', 'if', 'after', 'before'] },
      { name: 'Correlative conjunction', description: 'Works in pairs to connect equal elements.', examples: ['both … and', 'either … or', 'neither … nor', 'not only … but also'] },
    ],
  },
]

// ─── Connectors Data ─────────────────────────────────────────────────────────

type ConnectorRule = { connector: string; rule: string; pattern: string; examples: string[] }
type ConnectorPair = { title: string; tip: string; rules: ConnectorRule[] }

const connectorPairs: ConnectorPair[] = [
  {
    title: 'FOR vs TO (purpose)',
    tip: '"to" goes before a verb; "for" goes before a noun or gerund.',
    rules: [
      {
        connector: 'to',
        rule: 'Express purpose with a verb (infinitive).',
        pattern: 'to + base verb',
        examples: [
          'I went to the library to study.',
          'She called me to ask a question.',
          'He exercised to stay healthy.',
        ],
      },
      {
        connector: 'for',
        rule: 'Express purpose with a noun or gerund (–ing).',
        pattern: 'for + noun / for + verb-ing',
        examples: [
          'I went to the library for a book.',
          'This tool is used for cutting wood.',
          'Thanks for helping me yesterday.',
        ],
      },
    ],
  },
  {
    title: 'BECAUSE vs BECAUSE OF',
    tip: '"because" introduces a clause (subject + verb); "because of" introduces a noun phrase.',
    rules: [
      {
        connector: 'because',
        rule: 'Introduce a full clause explaining a reason.',
        pattern: 'because + subject + verb',
        examples: [
          'I stayed home because it was raining.',
          'She succeeded because she worked hard.',
        ],
      },
      {
        connector: 'because of',
        rule: 'Introduce a noun or noun phrase as a reason.',
        pattern: 'because of + noun phrase',
        examples: [
          'I stayed home because of the rain.',
          'The flight was cancelled because of bad weather.',
        ],
      },
    ],
  },
  {
    title: 'ALTHOUGH vs DESPITE / IN SPITE OF',
    tip: '"although" needs a clause; "despite" / "in spite of" need a noun phrase or gerund.',
    rules: [
      {
        connector: 'although / even though',
        rule: 'Show contrast with a full clause.',
        pattern: 'although + subject + verb',
        examples: [
          'Although it was cold, she wore a T-shirt.',
          'Even though he studied, he failed the test.',
        ],
      },
      {
        connector: 'despite / in spite of',
        rule: 'Show contrast with a noun phrase or gerund.',
        pattern: 'despite + noun / despite + verb-ing',
        examples: [
          'Despite the cold weather, she wore a T-shirt.',
          'In spite of studying hard, he failed the test.',
        ],
      },
    ],
  },
  {
    title: 'SO vs SO THAT',
    tip: '"so" shows a result; "so that" shows a purpose.',
    rules: [
      {
        connector: 'so',
        rule: 'Show a result or consequence.',
        pattern: '…, so + subject + verb',
        examples: [
          'It was raining, so I took an umbrella.',
          'She was tired, so she went to bed early.',
        ],
      },
      {
        connector: 'so that',
        rule: 'Show a goal or intended purpose.',
        pattern: 'so that + subject + can/could/will/would + verb',
        examples: [
          'I set an alarm so that I would not oversleep.',
          'Speak slowly so that everyone can understand.',
        ],
      },
    ],
  },
  {
    title: 'SINCE vs FOR (time)',
    tip: '"since" marks a starting point; "for" measures a duration.',
    rules: [
      {
        connector: 'since',
        rule: 'Mark the point in time when something started.',
        pattern: 'since + specific point in time',
        examples: [
          'She has lived here since 2019.',
          'I have not eaten since this morning.',
        ],
      },
      {
        connector: 'for',
        rule: 'Describe how long something has lasted.',
        pattern: 'for + period of time',
        examples: [
          'She has lived here for five years.',
          'I have not eaten for eight hours.',
        ],
      },
    ],
  },
  {
    title: 'WHEN vs WHILE vs AS',
    tip: 'All three relate to time, but the length and overlap of actions differ.',
    rules: [
      {
        connector: 'when',
        rule: 'A short or completed action happens at the same moment as another.',
        pattern: 'when + subject + simple past / present simple',
        examples: [
          'When I arrived, the show had already started.',
          'Call me when you finish.',
        ],
      },
      {
        connector: 'while',
        rule: 'Two longer actions overlap; both are in progress at the same time.',
        pattern: 'while + subject + past continuous',
        examples: [
          'I was cooking while she was studying.',
          'He fell asleep while he was reading.',
        ],
      },
      {
        connector: 'as',
        rule: 'Two actions happen at exactly the same time (simultaneous).',
        pattern: 'as + subject + verb (often continuous or simple)',
        examples: [
          'As I walked in, the lights went out.',
          'She smiled as she opened the gift.',
        ],
      },
    ],
  },
]

const classifications = [
  {
    title: 'Gerund as the subject',
    description:
      'The -ing word acts like a noun and becomes the main idea of the sentence.',
    sentence: 'Reading every day builds confidence.',
    focus: 'Reading',
  },
  {
    title: 'Gerund after a verb',
    description:
      'Some verbs are followed by a gerund, such as enjoy, avoid, and keep.',
    sentence: 'The class enjoys practicing short dialogues.',
    focus: 'practicing',
  },
  {
    title: 'Gerund after a preposition',
    description:
      'Use the gerund after prepositions like before, after, in, and by.',
    sentence: 'Before speaking, Nora takes one deep breath.',
    focus: 'speaking',
  },
]

const readingPractice = [
  {
    word: 'reading',
    pronunciation: 'REE-ding',
    syllables: 'read • ing',
    guidance: 'Stretch the long “ree” sound, then finish softly with “ding.”',
    sentence: 'Reading aloud helps you hear the rhythm of English.',
  },
  {
    word: 'swimming',
    pronunciation: 'SWIM-ing',
    syllables: 'swim • ming',
    guidance: 'Stress SWIM, then keep the ending short and smooth.',
    sentence: 'Swimming in the morning gives Ava energy for school.',
  },
  {
    word: 'traveling',
    pronunciation: 'TRAV-uh-ling',
    syllables: 'trav • el • ing',
    guidance: 'Say TRAV clearly first, then let the middle vowel stay light.',
    sentence: 'Traveling by train can feel calm and comfortable.',
  },
  {
    word: 'practicing',
    pronunciation: 'PRAK-tuh-sing',
    syllables: 'prac • tic • ing',
    guidance: 'Stress PRAK and connect the last two parts without stopping.',
    sentence: 'Practicing difficult words makes speaking easier.',
  },
]

const phraseMatches = [
  {
    phrase: 'enjoy reading',
    sentence: 'Many students enjoy reading stories with a partner.',
  },
  {
    phrase: 'practice speaking',
    sentence: 'We practice speaking in full sentences every afternoon.',
  },
  {
    phrase: 'think about traveling',
    sentence: 'Lina likes to think about traveling to new places.',
  },
  {
    phrase: 'interested in drawing',
    sentence: 'My cousin is interested in drawing comic characters.',
  },
]

// ─── Drag-and-Drop Exercise Data ─────────────────────────────────────────────

type DragWord = { id: string; word: string; sentence: string; answer: string }
type DropZone = { id: string; label: string; color: string }

const dragWords: DragWord[] = [
  { id: 'dw1', word: 'Cooking', sentence: '_____ is my favourite hobby.', answer: 'subject' },
  { id: 'dw2', word: 'swimming', sentence: 'She loves _____.', answer: 'after-verb' },
  { id: 'dw3', word: 'arriving', sentence: 'After _____, we checked in immediately.', answer: 'after-prep' },
  { id: 'dw4', word: 'Singing', sentence: '_____ loudly fills the room with joy.', answer: 'subject' },
  { id: 'dw5', word: 'writing', sentence: 'He finished _____ the report.', answer: 'after-verb' },
  { id: 'dw6', word: 'studying', sentence: 'She improved by _____ every morning.', answer: 'after-prep' },
]

const dropZones: DropZone[] = [
  { id: 'subject', label: 'Gerund as Subject', color: 'blue' },
  { id: 'after-verb', label: 'Gerund after a Verb', color: 'green' },
  { id: 'after-prep', label: 'Gerund after a Preposition', color: 'orange' },
]

const exercises = [
  {
    id: 1,
    prompt: 'Choose the best classification for the bold word: Walking helps me relax.',
    focus: 'Walking',
    options: ['Gerund as the subject', 'Gerund after a verb', 'Gerund after a preposition'],
    answer: 'Gerund as the subject',
    explanation: 'Walking names the activity and works as the subject of the sentence.',
  },
  {
    id: 2,
    prompt: 'Choose the best classification for the bold word: We avoid rushing in the hallway.',
    focus: 'rushing',
    options: ['Gerund as the subject', 'Gerund after a verb', 'Gerund after a preposition'],
    answer: 'Gerund after a verb',
    explanation: 'Avoid is one of the verbs that is followed by a gerund.',
  },
  {
    id: 3,
    prompt: 'Choose the best classification for the bold word: After finishing, please check your answer.',
    focus: 'finishing',
    options: ['Gerund as the subject', 'Gerund after a verb', 'Gerund after a preposition'],
    answer: 'Gerund after a preposition',
    explanation: 'After is a preposition, so the next verb should be in gerund form.',
  },
]

function App() {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [activePos, setActivePos] = useState(posCategories[0].pos)
  const [activeConnector, setActiveConnector] = useState(0)

  // Drag-and-drop state
  const [dragPlacements, setDragPlacements] = useState<Record<string, string>>({})
  const [showDragResults, setShowDragResults] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverZoneId, setDragOverZoneId] = useState<string | null>(null)

  const activePosData = posCategories.find((c) => c.pos === activePos) ?? posCategories[0]
  const activeConnectorData = connectorPairs[activeConnector]

  const score = useMemo(
    () =>
      exercises.reduce((total, exercise) => {
        return total + Number(answers[exercise.id] === exercise.answer)
      }, 0),
    [answers],
  )

  const dragScore = useMemo(
    () => dragWords.filter((w) => dragPlacements[w.id] === w.answer).length,
    [dragPlacements],
  )
  const allPlaced = dragWords.every((w) => dragPlacements[w.id])

  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('wordId', id)
    setDraggingId(id)
  }

  function handleDragEnd() {
    setDraggingId(null)
    setDragOverZoneId(null)
  }

  function handleZoneDragOver(e: React.DragEvent, zoneId: string) {
    e.preventDefault()
    setDragOverZoneId(zoneId)
  }

  function handleZoneDragLeave() {
    setDragOverZoneId(null)
  }

  function handleZoneDrop(e: React.DragEvent, zoneId: string) {
    e.preventDefault()
    const wordId = e.dataTransfer.getData('wordId')
    if (wordId) {
      setDragPlacements((p) => ({ ...p, [wordId]: zoneId }))
      setShowDragResults(false)
    }
    setDragOverZoneId(null)
    setDraggingId(null)
  }

  function handleBankDrop(e: React.DragEvent) {
    e.preventDefault()
    const wordId = e.dataTransfer.getData('wordId')
    if (wordId) {
      setDragPlacements((p) => {
        const next = { ...p }
        delete next[wordId]
        return next
      })
      setShowDragResults(false)
    }
    setDragOverZoneId(null)
    setDraggingId(null)
  }

  function handleDragReset() {
    setDragPlacements({})
    setShowDragResults(false)
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Gerunds learning studio</p>
          <h1>Classify gerunds, read them aloud, and practice in context.</h1>
          <p className="hero-copy">
            Learn how gerunds work in sentences, listen to the rhythm in each
            word, and review matching verb phrases with clear examples.
          </p>
        </div>
        <div className="firebase-card" aria-label="Firebase status">
          <p className="firebase-label">Firebase connected</p>
          <strong>{firebaseApp.name}</strong>
          <span>{firebaseProjectId}</span>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">1. Classify gerunds</p>
            <h2>See how the same -ing form can do different jobs.</h2>
          </div>
        </div>
        <div className="card-grid">
          {classifications.map((item) => (
            <article className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p className="example">
                <strong>{item.focus}</strong> → {item.sentence}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">2. Reading practice</p>
            <h2>Read the words with stress, syllables, and a sentence model.</h2>
          </div>
        </div>
        <div className="card-grid">
          {readingPractice.map((item) => (
            <article className="card reading-card" key={item.word}>
              <div className="reading-topline">
                <h3>{item.word}</h3>
                <span>{item.pronunciation}</span>
              </div>
              <p className="syllables">{item.syllables}</p>
              <p>{item.guidance}</p>
              <p className="example">{item.sentence}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">3. Matching phrases</p>
            <h2>Connect each word or verb phrase to a natural sentence.</h2>
          </div>
        </div>
        <div className="phrase-list">
          {phraseMatches.map((item) => (
            <article className="phrase-row" key={item.phrase}>
              <strong>{item.phrase}</strong>
              <p>{item.sentence}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading exercise-header">
          <div>
            <p className="eyebrow">4. Drag &amp; Drop</p>
            <h2>Sort each gerund into the correct category.</h2>
          </div>
          {showDragResults && (
            <p className="score">
              Score: {dragScore}/{dragWords.length}
            </p>
          )}
        </div>

        {/* Word bank */}
        <div
          className={`drag-bank${dragOverZoneId === 'bank' ? ' drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOverZoneId('bank') }}
          onDragLeave={handleZoneDragLeave}
          onDrop={handleBankDrop}
        >
          <p className="drag-bank-label">Word Bank — drag words to the categories below</p>
          <div className="drag-chips">
            {dragWords
              .filter((w) => !dragPlacements[w.id])
              .map((w) => (
                <div
                  key={w.id}
                  className={`drag-chip${draggingId === w.id ? ' dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, w.id)}
                  onDragEnd={handleDragEnd}
                >
                  <span className="drag-chip-word">{w.word}</span>
                  <span className="drag-chip-sentence">{w.sentence}</span>
                </div>
              ))}
            {allPlaced && (
              <p className="drag-bank-empty">All words placed — check your answers below.</p>
            )}
          </div>
        </div>

        {/* Drop zones */}
        <div className="drop-zones">
          {dropZones.map((zone) => (
            <div
              key={zone.id}
              className={`drop-zone drop-zone--${zone.color}${dragOverZoneId === zone.id ? ' drag-over' : ''}`}
              onDragOver={(e) => handleZoneDragOver(e, zone.id)}
              onDragLeave={handleZoneDragLeave}
              onDrop={(e) => handleZoneDrop(e, zone.id)}
            >
              <p className="drop-zone-label">{zone.label}</p>
              <div className="drag-chips">
                {dragWords
                  .filter((w) => dragPlacements[w.id] === zone.id)
                  .map((w) => {
                    const isCorrect = w.answer === zone.id
                    return (
                      <div
                        key={w.id}
                        className={`drag-chip${draggingId === w.id ? ' dragging' : ''}${
                          showDragResults ? (isCorrect ? ' correct-chip' : ' incorrect-chip') : ''
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, w.id)}
                        onDragEnd={handleDragEnd}
                      >
                        <span className="drag-chip-word">{w.word}</span>
                        <span className="drag-chip-sentence">{w.sentence}</span>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="drag-actions">
          <button
            type="button"
            className="drag-btn drag-btn--primary"
            onClick={() => setShowDragResults(true)}
            disabled={!allPlaced}
          >
            Check Answers
          </button>
          <button
            type="button"
            className="drag-btn drag-btn--secondary"
            onClick={handleDragReset}
          >
            Reset
          </button>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading exercise-header">
          <div>
            <p className="eyebrow">5. Exercises</p>
            <h2>Check your understanding.</h2>
          </div>
          <p className="score">
            Score: {score}/{exercises.length}
          </p>
        </div>
        <div className="exercise-list">
          {exercises.map((exercise) => {
            const selectedAnswer = answers[exercise.id]
            const isCorrect = selectedAnswer === exercise.answer

            return (
              <article className="card exercise-card" key={exercise.id}>
                <h3>{exercise.prompt}</h3>
                <p className="focus-word">Focus word: {exercise.focus}</p>
                <div className="options">
                  {exercise.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`option ${selectedAnswer === option ? 'selected' : ''}`}
                      onClick={() =>
                        setAnswers((current) => ({
                          ...current,
                          [exercise.id]: option,
                        }))
                      }
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {selectedAnswer ? (
                  <p className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? 'Correct.' : `Try again. Correct answer: ${exercise.answer}.`}{' '}
                    {exercise.explanation}
                  </p>
                ) : (
                  <p className="feedback">Select an answer to reveal the explanation.</p>
                )}
              </article>
            )
          })}
        </div>
      </section>
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">6. Word classification</p>
            <h2>Browse the main parts of speech and their sub-types.</h2>
          </div>
        </div>
        <div className="pos-tabs">
          {posCategories.map((cat) => (
            <button
              key={cat.pos}
              type="button"
              className={`pos-tab pos-tab--${cat.color} ${activePos === cat.pos ? 'pos-tab--active' : ''}`}
              onClick={() => setActivePos(cat.pos)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="card-grid wc-grid">
          {activePosData.types.map((type) => (
            <article className="card" key={type.name}>
              <h3>{type.name}</h3>
              <p>{type.description}</p>
              <ul className="example-list">
                {type.examples.map((ex) => (
                  <li key={ex}>{ex}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">7. Connectors &amp; linking words</p>
            <h2>Know when to use which connector and why.</h2>
          </div>
        </div>
        <div className="pos-tabs">
          {connectorPairs.map((pair, i) => (
            <button
              key={pair.title}
              type="button"
              className={`pos-tab pos-tab--teal ${activeConnector === i ? 'pos-tab--active' : ''}`}
              onClick={() => setActiveConnector(i)}
            >
              {pair.title.split('(')[0].trim()}
            </button>
          ))}
        </div>
        <div className="connector-tip">
          <span className="connector-tip-icon">💡</span>
          <p>{activeConnectorData.tip}</p>
        </div>
        <div className="connector-grid">
          {activeConnectorData.rules.map((rule) => (
            <article className="card connector-card" key={rule.connector}>
              <div className="connector-badge">{rule.connector.toUpperCase()}</div>
              <p className="connector-rule">{rule.rule}</p>
              <p className="connector-pattern">
                <strong>Pattern:</strong> {rule.pattern}
              </p>
              <ul className="example-list">
                {rule.examples.map((ex) => (
                  <li key={ex}>{ex}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
