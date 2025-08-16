// src/components/NotificationBell.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type Notification = {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

export default function NotificationBell({ user }: { user: User | null }) {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read_at).length);
      }
    };
    fetchNotifications();

    // Set up realtime subscription
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          toast.info(newNotification.title, {
            description: newNotification.body,
          });
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const handleMarkAsRead = async () => {
    if (!user || unreadCount === 0) return;

    const unreadIds = notifications
      .filter(n => !n.read_at)
      .map(n => n.id);

    // Mark as read in the UI immediately for responsiveness
    setUnreadCount(0);
    setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));

    // Update the database in the background
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds);
  };

  if (!user) return null;

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) handleMarkAsRead(); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map(n => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start whitespace-normal">
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.body}</p>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>You have no notifications.</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
