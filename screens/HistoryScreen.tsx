import { useEffect, useState } from 'react'
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { supabase } from '../lib/supabase'
import { Screen } from '../components/ui'
import { colors, moodColors, space, typo } from '../lib/theme'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type CheckIn = {
  id: string
  mood: number
  note: string | null
  created_at: string
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hours}:${minutes}`
}

export default function HistoryScreen({ userId }: { userId: string }) {
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

  function confirmDelete(item: CheckIn) {
    Alert.alert('Delete this check-in?', 'This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteOne(item.id) },
    ])
  }

  async function deleteOne(id: string) {
    const { data, error } = await supabase
      .from('check_ins')
      .delete()
      .eq('id', id)
      .select('id')
    if (error || !data || data.length === 0) {
      Alert.alert('Error', error?.message ?? 'Couldn’t delete this check-in.')
      return
    }
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  function confirmDeleteAll() {
    Alert.alert(
      'Delete all your check-ins?',
      'This removes your whole history, including older entries, and can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete all', style: 'destructive', onPress: deleteAll },
      ]
    )
  }

  async function deleteAll() {
    const { data, error } = await supabase
      .from('check_ins')
      .delete()
      .eq('user_id', userId)
      .select('id')
    if (error || !data || data.length === 0) {
      Alert.alert('Error', error?.message ?? 'Couldn’t delete your history.')
      return
    }
    setItems([])
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typo.title}>History</Text>
        {items.length > 0 && (
          <Pressable onPress={confirmDeleteAll} hitSlop={12}>
            <Text style={styles.action}>Delete all</Text>
          </Pressable>
        )}
      </View>

      {!loading && (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingBottom: space.lg }}
          ListEmptyComponent={<Text style={typo.muted}>No check-ins yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: moodColors[item.mood] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.date}>{formatDateTime(item.created_at)}</Text>
                {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
              </View>
              <Pressable onPress={() => confirmDelete(item)} hitSlop={12}>
                <Text style={styles.action}>Delete</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dot: { width: 20, height: 20, borderRadius: 10, marginRight: space.md },
  date: { ...typo.body, fontWeight: '600' },
  note: { ...typo.muted, marginTop: 2 },
  action: { ...typo.small, marginLeft: space.md },
})