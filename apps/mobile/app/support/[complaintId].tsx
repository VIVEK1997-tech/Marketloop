import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Text, View } from 'react-native';
import { StatusPill } from '@/components/payments/StatusPill';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { userRepository } from '@/services/api/user.repository';

const statusToneMap = {
  open: 'warning',
  investigating: 'info',
  resolved: 'success'
} as const;

export default function SupportComplaintDetailScreen() {
  const params = useLocalSearchParams<{ complaintId?: string }>();
  const complaintId = typeof params.complaintId === 'string' ? params.complaintId : '';

  const { data: complaint, isLoading } = useQuery({
    queryKey: ['support-complaint', complaintId],
    queryFn: () => userRepository.getSupportComplaintDetail(complaintId),
    enabled: !!complaintId
  });

  if (!complaintId) {
    return (
      <Screen>
        <EmptyState title="Support request missing" description="We could not determine which support request you wanted to open." />
      </Screen>
    );
  }

  if (isLoading) {
    return (
      <Screen>
        <Text className="text-sm text-slate-500">Loading support request...</Text>
      </Screen>
    );
  }

  if (!complaint) {
    return (
      <Screen>
        <EmptyState title="Support request not found" description="This support item may have been removed or is no longer available for your account." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="gap-5">
        <Card>
          <Text className="text-2xl font-black text-slate-900">{complaint.complaintType}</Text>
          <Text className="mt-2 text-sm text-slate-500">{complaint.complaintId}</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <StatusPill label={complaint.status} tone={statusToneMap[complaint.status]} />
            {complaint.raisedByRole ? <StatusPill label={`Raised as ${complaint.raisedByRole}`} tone="neutral" /> : null}
          </View>
        </Card>

        <Card>
          <Text className="text-lg font-bold text-slate-900">Issue summary</Text>
          <Text className="mt-3 text-sm text-slate-500">Against</Text>
          <Text className="mt-1 text-sm text-slate-800">{complaint.against}</Text>
          <Text className="mt-3 text-sm text-slate-500">Notes submitted</Text>
          <Text className="mt-1 text-sm leading-6 text-slate-800">{complaint.note}</Text>
          {complaint.resolutionNotes ? (
            <>
              <Text className="mt-3 text-sm text-slate-500">Resolution notes</Text>
              <Text className="mt-1 text-sm leading-6 text-slate-800">{complaint.resolutionNotes}</Text>
            </>
          ) : null}
        </Card>

        <Card>
          <Text className="text-lg font-bold text-slate-900">Linked references</Text>
          <Text className="mt-3 text-sm text-slate-500">Order</Text>
          <Text className="mt-1 text-sm text-slate-800">{complaint.linkedOrderId || 'Not linked'}</Text>
          <Text className="mt-3 text-sm text-slate-500">Payment</Text>
          <Text className="mt-1 text-sm text-slate-800">{complaint.linkedPaymentId || 'Not linked'}</Text>
        </Card>

        <Card>
          <Text className="text-lg font-bold text-slate-900">Timeline</Text>
          <Text className="mt-3 text-sm text-slate-800">Request created</Text>
          <Text className="mt-1 text-xs text-slate-500">{new Date(complaint.createdAt).toLocaleString()}</Text>
          <Text className="mt-3 text-sm text-slate-800">Latest update</Text>
          <Text className="mt-1 text-xs text-slate-500">{new Date(complaint.updatedAt).toLocaleString()}</Text>
          <Text className="mt-3 text-sm text-slate-800">Current handling state</Text>
          <Text className="mt-1 text-xs text-slate-500">Your request is currently marked as {complaint.status}.</Text>
        </Card>
      </View>
    </Screen>
  );
}
