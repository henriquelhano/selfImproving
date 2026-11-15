import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { supabase } from '../lib/supabase'
import PathDetailScreen from './PathDetailScreen'

type Path = { id: string; title: string; summary: string }

export default function PathsScreen({ userId }: { userId: string }) {
  const [paths, setPaths] = useState<Path[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Path | null>(null)

  useEffect(() => {
    supabase
      .from('paths')
      .select('id, title, summary')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) Alert.alert('Erro', error.message)
        setPaths(data ?? [])
        setLoading(false)
      })
  }, [])

  if (selected) {
    return (
      <PathDetailScreen
        path={selected}
        userId={userId}
        onBack={() => setSelected(null)}
      />
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Paths</Text>
      <Text style={styles.subtitle}>
        Small steps, at your own pace. Choose what seems most like what you feel.
      </Text>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <ScrollView>
          {paths.length === 0 && <Text>No paths available.</Text>}
          {paths.map((p) => (
            <Pressable key={p.id} style={styles.card} onPress={() => setSelected(p)}>
              <Text style={styles.cardTitle}>{p.title}</Text>
              <Text style={styles.cardSummary}>{p.summary}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80 },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 8 },
  subtitle: { color: '#555', marginBottom: 20 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  cardSummary: { color: '#555' },
})