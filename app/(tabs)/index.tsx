import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { login, me, getSignalements } from '../../src/api/client';

export default function HomeScreen() {
  const [msg, setMsg] = useState('Ready');

  async function test() {
    try {
      setMsg('Login...');
      await login('test@gmail.com', 'Azerty123');

      setMsg('Fetching me...');
      const u = await me();
      setMsg(`Bonjour ${u.name} (${u.role})`);

      const list = await getSignalements();
      setMsg(`OK, signalements: ${list.length}`);
    } catch (e: any) {
      setMsg(`Erreur: ${e.message}`);
    }
  }

  return (
      <View style={{ padding: 40 }}>
        <Text style={{ marginBottom: 12 }}>{msg}</Text>
        <Button title="Tester API" onPress={test} />
      </View>
  );
}
