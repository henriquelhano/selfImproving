import { useState } from 'react'
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { todayLocal } from '../lib/dates'
import { Button, Input, Screen } from '../components/ui'
import { colors, moodColors, space, typo } from '../lib/theme'

const MOODS = [
  { value: 1, label: 'Rough' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Great' },
]

export default function CheckInScreen({ userId }: { userId: string }) {
  const [mood, setMood] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  async function save() {
    if (mood === null) return
    Keyboard.dismiss()
    setSaving(true)
    const { error } = await supabase.from('check_ins').insert({
      user_id: userId,
      mood,
      note: note.trim() || null,
      checked_in_on: todayLocal(),
    })
    setSaving(false)
    if (error) {
      Alert.alert('Error', error.message)
      return
    }
    setMood(null)
    setNote('')
    setJustSaved(true)
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ flex: 1 }}>
        <Screen>
          <Text style={styles.title}>How are you right now?</Text>

          <View style={styles.moods}>
            {MOODS.map((m) => {
              const selected = mood === m.value
              const dimmed = mood !== null && !selected
              return (
                <Pressable
                  key={m.value}
                  onPress={() => {
                    setMood(m.value)
                    setJustSaved(false)
                  }}
                  style={styles.moodItem}
                >
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: moodColors[m.value] },
                      selected && styles.dotSelected,
                      dimmed && styles.dotDimmed,
                    ]}
                  />
                  <Text style={[styles.moodLabel, selected && styles.moodLabelSelected]}>
                    {m.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>

          <Input
            style={styles.note}
            placeholder="Anything to add? (optional)"
            multiline
            value={note}
            onChangeText={(t) => {
              setNote(t)
              setJustSaved(false)
            }}
          />

          <Button
            title={saving ? 'Saving...' : 'Save'}
            onPress={save}
            disabled={mood === null || saving}
          />

          {justSaved && <Text style={styles.confirm}>Saved</Text>}
        </Screen>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  title: { ...typo.title, marginBottom: space.xl },
  moods: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.xl },
  moodItem: { alignItems: 'center', width: 62 },
  dot: { width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: 'transparent' },
  dotSelected: { borderColor: colors.text },
  dotDimmed: { opacity: 0.4 },
  moodLabel: { ...typo.small, marginTop: space.sm },
  moodLabelSelected: { color: colors.text, fontWeight: '600' },
  note: { minHeight: 100, textAlignVertical: 'top' },
  confirm: { ...typo.body, color: colors.success, textAlign: 'center', marginTop: space.md },
})