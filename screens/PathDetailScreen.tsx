import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Screen } from '../components/ui'
import { colors, moodColors, radius, space, typo } from '../lib/theme'

type Path = { id: string; title: string; summary: string }
type Step = {
  id: string
  position: number
  kind: 'learn' | 'try' | 'connect'
  title: string
  body: string
}
type Progress = { status: 'done' | 'skipped'; mood_after: number | null }

const KIND_LABEL = { learn: 'Understand', try: 'Try', connect: 'Connect' }

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
      if (stepsRes.error) Alert.alert('Error', stepsRes.error.message)
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
    const mood = step.kind === 'try' && status === 'done' ? moods[step.id] ?? null : null
    const { error } = await supabase.from('step_progress').upsert(
      { user_id: userId, step_id: step.id, status, mood_after: mood },
      { onConflict: 'user_id,step_id' }
    )
    setSaving(false)
    if (error) {
      Alert.alert('Error', error.message)
      return
    }
    setProgress((prev) => ({ ...prev, [step.id]: { status, mood_after: mood } }))
    setOpenId(null)
  }

  const doneCount = steps.filter((s) => progress[s.id]?.status === 'done').length

  return (
    <Screen>
      <Pressable onPress={onBack} hitSlop={12}>
        <Text style={styles.back}>Back</Text>
      </Pressable>
      <Text style={styles.title}>{path.title}</Text>
      <Text style={styles.subtitle}>{path.summary}</Text>

      {!loading && (
        <ScrollView contentContainerStyle={{ paddingBottom: space.xl }}>
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
                    {prog?.status === 'done' ? ' · done' : ''}
                    {prog?.status === 'skipped' ? ' · skipped' : ''}
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
                          {[1, 2, 3, 4, 5].map((v) => (
                            <Pressable
                              key={v}
                              onPress={() => setMoods((prev) => ({ ...prev, [s.id]: v }))}
                              hitSlop={6}
                            >
                              <View
                                style={[
                                  styles.dot,
                                  { backgroundColor: moodColors[v] },
                                  moods[s.id] === v && styles.dotSelected,
                                  moods[s.id] !== undefined &&
                                    moods[s.id] !== v &&
                                    styles.dotDimmed,
                                ]}
                              />
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    )}

                    <View style={styles.actions}>
                      <View style={{ flex: 1 }}>
                        <Button title="Done" onPress={() => mark(s, 'done')} disabled={saving} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button
                          title="Skip"
                          onPress={() => mark(s, 'skipped')}
                          disabled={saving}
                          variant="secondary"
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )
          })}

          <Text style={styles.disclaimer}>
            This doesn’t replace professional help. If you’re in danger or thinking about
            hurting yourself, call your local emergency number (112 in the EU) or a crisis
            line in your country.
          </Text>
        </ScrollView>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  back: { ...typo.body, color: colors.accent, marginBottom: space.md },
  title: { ...typo.title, marginBottom: space.sm },
  subtitle: { ...typo.muted, marginBottom: space.lg },
  count: { ...typo.small, marginBottom: space.md },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
  },
  cardDone: { borderColor: colors.success },
  kind: { ...typo.small, marginBottom: space.xs },
  stepTitle: { ...typo.heading },
  body: { ...typo.body, marginTop: space.md, color: colors.text },
  moodPrompt: { ...typo.muted, marginTop: space.lg, marginBottom: space.md },
  moods: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: space.sm },
  dot: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: 'transparent' },
  dotSelected: { borderColor: colors.text },
  dotDimmed: { opacity: 0.4 },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  disclaimer: { ...typo.small, marginTop: space.lg },
})