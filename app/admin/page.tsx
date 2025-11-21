"use client";

import { useEffect, useState } from "react";

import { AdminHeaderCard } from "@/components/admin/AdminHeaderCard";
import { AdminLoginCard } from "@/components/admin/AdminLoginCard";
import { CollectionsCard } from "@/components/admin/CollectionsCard";
import { EventCreationSection } from "@/components/admin/EventCreationSection";
import { EventsCard } from "@/components/admin/EventsCard";
import { ParticipantsCard } from "@/components/admin/ParticipantsCard";
import { CreateTaskCollectionModal } from "@/components/tasks/CreateTaskCollectionModal";
import { useApp } from "@/lib/context";
import {
  getEvents,
  getParticipants,
  getSantaCollections,
  getSantaTasks,
  Event,
  LoginRequest,
} from "@/lib/api";
import type {
  AuthResponse,
  Participant,
  SantaCollection,
  SantaTask,
} from "@/lib/types";

export default function AdminPage() {
  const { currentUser, login: loginUser } = useApp();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginRequest>({
    phoneNumber: "",
    password: "",
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<SantaTask[]>([]);
  const [collections, setCollections] = useState<SantaCollection[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [collectionsError, setCollectionsError] = useState<string | null>(null);
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.isAdmin) {
      loadEvents();
      loadTasks();
      loadCollections();
      loadParticipants();
    }
  }, [currentUser]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (err) {
      console.error("Ошибка при загрузке событий:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const tasksData = await getSantaTasks();
      setTasks(tasksData);
    } catch (err) {
      console.error("Error loading tasks:", err);
      throw err;
    }
  };

  const loadCollections = async () => {
    try {
      setCollectionsLoading(true);
      setCollectionsError(null);
      const collectionsData = await getSantaCollections();
      setCollections(collectionsData);
    } catch (err) {
      console.error("Ошибка при загрузке коллекций:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Не удалось загрузить коллекции задач";
      setCollectionsError(errorMessage);
    } finally {
      setCollectionsLoading(false);
    }
  };

  const loadParticipants = async () => {
    try {
      setParticipantsLoading(true);
      setParticipantsError(null);
      const participantsData = await getParticipants();
      setParticipants(participantsData);
    } catch (err) {
      console.error("Ошибка при загрузке участников:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Не удалось загрузить участников";
      setParticipantsError(errorMessage);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleCreateEventSuccess = () => {
    setShowCreateForm(false);
    loadEvents();
  };

  const handleCollectionCreated = (collection: SantaCollection) => {
    setCollections((prev) => [collection, ...prev]);
    setIsCollectionModalOpen(false);
    loadTasks();
  };

  const handleParticipantUpdated = (updatedParticipant: Participant) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === updatedParticipant.id ? updatedParticipant : p))
    );
  };

  const handleLoginSuccess = (response: AuthResponse) => {
    if (!response.user.isAdmin) {
      setLoginError("Этот пользователь не является администратором.");
      return;
    }

    loginUser(response.user, response.accessToken);
  };

  const handleLoginError = (error: string) => {
    setLoginError(error);
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <AdminLoginCard
          loginForm={loginForm}
          loginError={loginError}
          onPhoneChange={(phone) => setLoginForm({ ...loginForm, phoneNumber: phone })}
          onLoginSuccess={handleLoginSuccess}
          onLoginError={handleLoginError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <AdminHeaderCard />

        <EventCreationSection
          showCreateForm={showCreateForm}
          onToggleForm={setShowCreateForm}
          onCreateSuccess={handleCreateEventSuccess}
        />

        <EventsCard events={events} loading={loading} />

        <CollectionsCard
          collections={collections}
          loading={collectionsLoading}
          error={collectionsError}
          onRefresh={loadCollections}
          onCreateCollection={() => setIsCollectionModalOpen(true)}
        />

        <ParticipantsCard
          participants={participants}
          events={events}
          collections={collections}
          loading={participantsLoading}
          error={participantsError}
          onRefresh={loadParticipants}
          onParticipantUpdated={handleParticipantUpdated}
        />
      </div>

      {isCollectionModalOpen && (
        <CreateTaskCollectionModal
          tasks={tasks}
          onClose={() => setIsCollectionModalOpen(false)}
          onCreated={handleCollectionCreated}
        />
      )}
    </div>
  );
}


