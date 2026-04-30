import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pressable, Text, View } from 'react-native';
import { SectionHeader } from '@/components/marketplace/SectionHeader';
import { StatusPill } from '@/components/payments/StatusPill';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { getApiErrorMessage } from '@/services/api/client';
import { userRepository } from '@/services/api/user.repository';

const complaintTypes = ['Buyer Complaint', 'Seller Complaint', 'Payment Dispute', 'Refund Request', 'Delivery Issue', 'Quality Complaint'];

const statusToneMap = {
  open: 'warning',
  investigating: 'info',
  resolved: 'success'
} as const;

export default function SupportCenterScreen() {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState(complaintTypes[0]);
  const [against, setAgainst] = useState('');
  const [linkedOrderId, setLinkedOrderId] = useState('');
  const [linkedPaymentId, setLinkedPaymentId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['support-complaints'],
    queryFn: userRepository.getSupportComplaints
  });

  const summary = useMemo(
    () => ({
      open: complaints.filter((complaint) => complaint.status === 'open').length,
      investigating: complaints.filter((complaint) => complaint.status === 'investigating').length,
      resolved: complaints.filter((complaint) => complaint.status === 'resolved').length
    }),
    [complaints]
  );

  const createComplaint = useMutation({
    mutationFn: userRepository.createSupportComplaint,
    onSuccess: async () => {
      setAgainst('');
      setLinkedOrderId('');
      setLinkedPaymentId('');
      setNote('');
      setError('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['support-complaints'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      ]);
    },
    onError: (mutationError) => {
      setError(getApiErrorMessage(mutationError));
    }
  });

  const handleCreate = async () => {
    if (!against.trim() || !note.trim()) {
      setError('Add who the issue is against and a short note so the support team has enough context.');
      return;
    }

    await createComplaint.mutateAsync({
      complaintType: selectedType,
      against: against.trim(),
      note: note.trim(),
      linkedOrderId: linkedOrderId.trim(),
      linkedPaymentId: linkedPaymentId.trim()
    });
  };

  return (
    <Screen>
      <View className="gap-5">
        <SectionHeader title="Support Center" subtitle="Create and track complaints, payment disputes, delivery issues, and account safety requests." />

        <Card>
          <Text className="text-lg font-bold text-slate-900">Support snapshot</Text>
          <View className="mt-4 flex-row flex-wrap gap-2">
            <StatusPill label={`Open ${summary.open}`} tone="warning" />
            <StatusPill label={`Investigating ${summary.investigating}`} tone="info" />
            <StatusPill label={`Resolved ${summary.resolved}`} tone="success" />
          </View>
        </Card>

        <Card>
          <Text className="text-lg font-bold text-slate-900">Raise a support request</Text>
          <Text className="mt-2 text-sm text-slate-500">Use this for payment disputes, refund issues, delivery problems, seller complaints, or safety concerns.</Text>
          <View className="mt-4 flex-row flex-wrap gap-2">
            {complaintTypes.map((type) => (
              <Pressable
                key={type}
                onPress={() => setSelectedType(type)}
                className={`rounded-full px-3 py-2 ${selectedType === type ? 'bg-brand-600' : 'border border-slate-200 bg-white'}`}
              >
                <Text className={`text-xs font-semibold ${selectedType === type ? 'text-white' : 'text-slate-600'}`}>{type}</Text>
              </Pressable>
            ))}
          </View>
          <View className="mt-4 gap-3">
            <Input value={against} onChangeText={setAgainst} placeholder="Against seller, buyer, delivery partner, or issue target" />
            <Input value={linkedOrderId} onChangeText={setLinkedOrderId} placeholder="Linked order ID (optional)" />
            <Input value={linkedPaymentId} onChangeText={setLinkedPaymentId} placeholder="Linked payment ID (optional)" />
            <Input
              value={note}
              onChangeText={setNote}
              placeholder="Describe the issue clearly so the support team can act quickly"
              multiline
              textAlignVertical="top"
              style={{ minHeight: 110 }}
            />
            {error ? <Text className="text-sm text-rose-600">{error}</Text> : null}
            <Button label={createComplaint.isPending ? 'Submitting request...' : 'Submit support request'} onPress={handleCreate} disabled={createComplaint.isPending} />
          </View>
        </Card>

        <View className="gap-3">
          <Text className="text-lg font-bold text-slate-900">Recent requests</Text>
          {isLoading ? <Text className="text-sm text-slate-500">Loading your support history...</Text> : null}
          {!isLoading && !complaints.length ? (
            <EmptyState title="No support requests yet" description="When you create a complaint or dispute from mobile, it will appear here with status updates." />
          ) : null}
          {complaints.map((complaint) => (
            <Pressable
              key={complaint.complaintId}
              onPress={() => router.push(`/support/${complaint.complaintId}` as never)}
            >
              <Card>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-slate-900">{complaint.complaintType}</Text>
                    <Text className="mt-1 text-sm text-slate-500">{complaint.complaintId}</Text>
                    <Text className="mt-2 text-sm text-slate-600">Against: {complaint.against}</Text>
                    <Text className="mt-2 text-sm text-slate-500" numberOfLines={2}>
                      {complaint.note}
                    </Text>
                  </View>
                  <StatusPill label={complaint.status} tone={statusToneMap[complaint.status]} />
                </View>
                <View className="mt-3 flex-row flex-wrap gap-2">
                  {complaint.linkedOrderId ? <StatusPill label={`Order ${complaint.linkedOrderId}`} tone="neutral" /> : null}
                  {complaint.linkedPaymentId ? <StatusPill label={`Payment ${complaint.linkedPaymentId}`} tone="neutral" /> : null}
                </View>
                <Text className="mt-3 text-xs text-slate-400">Updated {new Date(complaint.updatedAt).toLocaleString()}</Text>
              </Card>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}
