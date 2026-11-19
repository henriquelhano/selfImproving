import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import { supabase } from '../lib/supabase'
import { Screen } from '../components/ui'
import { colors, radius, space, typo } from '../lib/theme'
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
        if (error) Alert.alert('Error', error.message)
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
    <Screen>
      <Text style={styles.title}>Paths</Text>
      <Text style={styles.subtitle}>
        Small steps, at your pace. Pick the one that sounds most like what you’re feeling.
      </Text>

      {!loading && (
        <ScrollView contentContainerStyle={{ paddingBottom: space.lg }}>
          {paths.length === 0 && <Text style={typo.muted}>No paths available yet.</Text>}
          {paths.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => setSelected(p)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.cardTitle}>{p.title}</Text>
              <Text style={typo.muted}>{p.summary}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { ...typo.title, marginBottom: space.sm },
  subtitle: { ...typo.muted, marginBottom: space.lg },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
  },
  cardTitle: { ...typo.heading, marginBottom: space.sm },
})