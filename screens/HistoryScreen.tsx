import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { supabase } from '../lib/supabase'

const EMOJIS = ['', '😞', '😕', '😐', '🙂', '😄']

type CheckIn = {
  id: string
  mood: number
  note: string | null
  created_at: string
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()} às ${hours}:${minutes}`
}

export default function HistoryScreen() {
  const [items, setItems] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('check_ins')
      .select('id, mood, note, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setItems(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return null

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text>Ainda não tens check-ins.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.emoji}>{EMOJIS[item.mood]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>
              {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
            </View>
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80 },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  emoji: { fontSize: 28, marginRight: 14 },
  date: { fontWeight: '600' },
  note: { color: '#555', marginTop: 2 },
})