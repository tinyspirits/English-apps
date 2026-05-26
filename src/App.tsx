import { useMemo, useState } from 'react'
import './App.css'
import { firebaseApp, firebaseProjectId } from './firebase'

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

  const score = useMemo(
    () =>
      exercises.reduce((total, exercise) => {
        return total + Number(answers[exercise.id] === exercise.answer)
      }, 0),
    [answers],
  )

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
            <p className="eyebrow">4. Exercises</p>
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
    </main>
  )
}

export default App
