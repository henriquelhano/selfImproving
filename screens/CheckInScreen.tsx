import { useState } from 'react'
import {
  Alert,
  Button,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { supabase } from '../lib/supabase'
import { todayLocal } from '../lib/dates'

const MOODS = [
  { value: 1, emoji: '😞', label: 'Mal' },
  { value: 2, emoji: '😕', label: 'Em baixo' },
  { value: 3, emoji: '😐', label: 'Assim-assim' },
  { value: 4, emoji: '🙂', label: 'Bem' },
  { value: 5, emoji: '😄', label: 'Ótimo' },
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
      Alert.alert('Erro', error.message)
      return
    }
    // Limpa o formulário para o próximo registo
    setMood(null)
    setNote('')
    setJustSaved(true)
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Como estás agora?</Text>

        <View style={styles.moods}>
          {MOODS.map((m) => (
            <Pressable
              key={m.value}
              onPress={() => {
                setMood(m.value)
                setJustSaved(false)
              }}
              style={[styles.mood, mood === m.value && styles.moodSelected]}
            >
              <Text style={styles.emoji}>{m.emoji}</Text>
              <Text style={styles.moodLabel}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Queres acrescentar alguma coisa? (opcional)"
          multiline
          value={note}
          onChangeText={(t) => {
            setNote(t)
            setJustSaved(false)
          }}
        />

        <Button
          title={saving ? 'A guardar...' : 'Guardar'}
          onPress={save}
          disabled={mood === null || saving}
        />

        {justSaved && <Text style={styles.confirm}>Guardado ✓</Text>}
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80 },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 24 },
  moods: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  mood: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    width: 62,
  },
  moodSelected: { borderColor: '#4a7cff', backgroundColor: '#eef2ff' },
  emoji: { fontSize: 32 },
  moodLabel: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  confirm: { textAlign: 'center', marginTop: 16, fontSize: 16, color: '#2e7d32' },
})