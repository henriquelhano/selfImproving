import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import AuthScreen from './screens/AuthScreen'
import CheckInScreen from './screens/CheckInScreen'
import HistoryScreen from './screens/HistoryScreen'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'today' | 'history'>('today')

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

  if (loading) return null
  if (!session) return <AuthScreen />

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {tab === 'today' ? (
          <CheckInScreen userId={session.user.id} />
        ) : (
          <HistoryScreen />
        )}
      </View>

      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#ddd', paddingBottom: 24 }}>
        <TabButton label="Today" active={tab === 'today'} onPress={() => setTab('today')} />
        <TabButton label="History" active={tab === 'history'} onPress={() => setTab('history')} />
        <TabButton label="Log Out" active={false} onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  )
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1, padding: 16, alignItems: 'center' }}>
      <Text style={{ fontWeight: active ? '700' : '400' }}>{label}</Text>
    </Pressable>
  )
}