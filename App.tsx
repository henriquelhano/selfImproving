import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import AuthScreen from './screens/AuthScreen'
import CheckInScreen from './screens/CheckInScreen'
import HistoryScreen from './screens/HistoryScreen'
import PathsScreen from './screens/PathsScreen'
import { colors } from './lib/theme'

type Tab = 'today' | 'paths' | 'history'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('today')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  if (loading) return <View style={{ flex: 1, backgroundColor: colors.bg }} />

  if (!session) {
    return (
      <>
        <StatusBar style="light" />
        <AuthScreen />
      </>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        {tab === 'today' && <CheckInScreen userId={session.user.id} />}
        {tab === 'paths' && <PathsScreen userId={session.user.id} />}
        {tab === 'history' && <HistoryScreen userId={session.user.id} />}
      </View>

      <View style={styles.tabBar}>
        <TabButton label="Today" active={tab === 'today'} onPress={() => setTab('today')} />
        <TabButton label="Paths" active={tab === 'paths'} onPress={() => setTab('paths')} />
        <TabButton label="History" active={tab === 'history'} onPress={() => setTab('history')} />
        <TabButton label="Sign out" active={false} muted onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  )
}

function TabButton({
  label,
  active,
  muted,
  onPress,
}: {
  label: string
  active: boolean
  muted?: boolean
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: active ? '700' : '500',
          color: active ? colors.accent : muted ? colors.muted : colors.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 24,
  },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
})