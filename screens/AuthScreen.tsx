import { useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input, Screen } from '../components/ui'
import { space, typo } from '../lib/theme'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signIn() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) Alert.alert('Error', error.message)
    setLoading(false)
  }

  async function signUp() {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) Alert.alert('Error', error.message)
    setLoading(false)
  }

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>A quiet place to check in with yourself.</Text>

        <Input
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.buttons}>
          <Button title="Sign in" onPress={signIn} disabled={loading} />
          <Button
            title="Create account"
            onPress={signUp}
            disabled={loading}
            variant="secondary"
          />
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', paddingBottom: 64 },
  title: { ...typo.title, marginBottom: space.sm },
  subtitle: { ...typo.muted, marginBottom: space.xl },
  buttons: { gap: space.sm, marginTop: space.sm },
})