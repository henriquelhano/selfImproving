import { useEffect, useState } from 'react'
import { Alert, Button, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { supabase } from '../lib/supabase'

type Path = { id: string; title: string; summary: string }
type Step = {
  id: string
  position: number
  kind: 'learn' | 'try' | 'connect'
  title: string
  body: string
}
type Progress = { status: 'done' | 'skipped'; mood_after: number | null }

const KIND_LABEL = { learn: 'Learn', try: 'Try', connect: 'Connect' }
const EMOJIS = ['😞', '😕', '😐', '🙂', '😄']

export default function PathDetailScreen({
  path,
  userId,
  onBack,
}: {
  path: Path
  userId: string
  onBack: () => void
}) {
  const [steps, setSteps] = useState<Step[]>([])
  const [progress, setProgress] = useState<Record<string, Progress>>({})
  const [openId, setOpenId] = useState<string | null>(null)
  const [moods, setMoods] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const [stepsRes, progRes] = await Promise.all([
        supabase
          .from('path_steps')
          .select('id, position, kind, title, body')
          .eq('path_id', path.id)
          .order('position', { ascending: true }),
        supabase.from('step_progress').select('step_id, status, mood_after'),
      ])
      if (stepsRes.error) Alert.alert('Erro', stepsRes.error.message)
      setSteps((stepsRes.data ?? []) as Step[])

      const map: Record<string, Progress> = {}
      for (const p of progRes.data ?? []) {
        map[p.step_id] = { status: p.status, mood_after: p.mood_after }
      }
      setProgress(map)
      setLoading(false)
    }
    load()
  }, [path.id])

  async function mark(step: Step, status: 'done' | 'skipped') {
    setSaving(true)
    const mood =
      step.kind === 'try' && status === 'done' ? moods[step.id] ?? null : null
    const { error } = await supabase.from('step_progress').upsert(
      { user_id: userId, step_id: step.id, status, mood_after: mood },
      { onConflict: 'user_id,step_id' }
    )
    setSaving(false)
    if (error) {
      Alert.alert('Erro', error.message)
      return
    }
    setProgress((prev) => ({ ...prev, [step.id]: { status, mood_after: mood } }))
    setOpenId(null)
  }

  const doneCount = steps.filter((s) => progress[s.id]?.status === 'done').length

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>
      <Text style={styles.title}>{path.title}</Text>
      <Text style={styles.subtitle}>{path.summary}</Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <ScrollView>
          <Text style={styles.count}>
            {doneCount} of {steps.length} steps done
          </Text>

          {steps.map((s) => {
            const prog = progress[s.id]
            const open = openId === s.id
            return (
              <View
                key={s.id}
                style={[styles.card, prog?.status === 'done' && styles.cardDone]}
              >
                <Pressable onPress={() => setOpenId(open ? null : s.id)}>
                  <Text style={styles.kind}>
                    {KIND_LABEL[s.kind]}
                    {prog?.status === 'done' ? '  ✓' : ''}
                    {prog?.status === 'skipped' ? '  (skipped)' : ''}
                  </Text>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                </Pressable>

                {open && (
                  <View>
                    <Text style={styles.body}>{s.body}</Text>

                    {s.kind === 'try' && (
                      <View>
                        <Text style={styles.moodPrompt}>
                          How did you feel afterwards? (optional)
                        </Text>
                        <View style={styles.moods}>
                          {EMOJIS.map((e, i) => (
                            <Pressable
                              key={i}
                              onPress={() =>
                                setMoods((prev) => ({ ...prev, [s.id]: i + 1 }))
                              }
                              style={[
                                styles.moodBtn,
                                moods[s.id] === i + 1 && styles.moodSelected,
                              ]}
                            >
                              <Text style={styles.moodEmoji}>{e}</Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    )}

                    <View style={styles.actions}>
                      <Button title="Done" onPress={() => mark(s, 'done')} disabled={saving} />
                      <Button
                        title="Skip"
                        onPress={() => mark(s, 'skipped')}
                        disabled={saving}
                        color="#888"
                      />
                    </View>
                  </View>
                )}
              </View>
            )
          })}

          <Text style={styles.disclaimer}>
            This does not substitute professional help. If you are in danger or thinking of
            harming yourself, call 112 or look for the support line in your country.
          </Text>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 70 },
  back: { color: '#4a7cff', fontSize: 16, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 6 },
  subtitle: { color: '#555', marginBottom: 16 },
  count: { fontWeight: '600', marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardDone: { backgroundColor: '#f1f8f1', borderColor: '#b9dcb9' },
  kind: { fontSize: 12, color: '#777', marginBottom: 4, textTransform: 'uppercase' },
  stepTitle: { fontSize: 17, fontWeight: '600' },
  body: { marginTop: 12, lineHeight: 22, color: '#333' },
  moodPrompt: { marginTop: 16, marginBottom: 8, color: '#555' },
  moods: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: {
    padding: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodSelected: { borderColor: '#4a7cff', backgroundColor: '#eef2ff' },
  moodEmoji: { fontSize: 28 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  disclaimer: { color: '#777', fontSize: 12, marginVertical: 24, lineHeight: 18 },
})