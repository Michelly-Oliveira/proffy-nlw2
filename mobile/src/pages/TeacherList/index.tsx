import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TextInput } from "react-native";
import { BorderlessButton, RectButton } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-community/async-storage";

import PageHeader from "../../components/PageHeader";
import TeacherItem, { Teacher } from "../../components/TeacherItem";

import styles from "./styles";
import api from "../../services/api";

const TeacherList: React.FC = () => {
  const [areFiltersvisible, setAreFiltersVisible] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  const [subject, setSubject] = useState("");
  const [week_day, setWeekDay] = useState("");
  const [time, setTime] = useState("");

  const handleToogleFiltersVisible = useCallback(() => {
    setAreFiltersVisible(!areFiltersvisible);
  }, [areFiltersvisible]);

  const loadFavorites = useCallback(() => {
    AsyncStorage.getItem("favorites").then((response) => {
      if (response) {
        const favoriteTeachers = JSON.parse(response);
        const favoriteTeachersId = favoriteTeachers.map(
          (teacher: Teacher) => teacher.id
        );

        setFavorites(favoriteTeachersId);
      }
    });
  }, []);

  const formatWeekDay = useCallback((day) => {
    let getNumberOfDay = "";

    switch (day) {
      case "Domingo":
        getNumberOfDay = "0";
        break;
      case "Segunda-feira":
        getNumberOfDay = "1";
        break;
      case "Terça-feira":
        getNumberOfDay = "2";
        break;
      case "Quarta-feira":
        getNumberOfDay = "3";
        break;
      case "Quinta-feira":
        getNumberOfDay = "4";
        break;
      case "Sexta-feira":
        getNumberOfDay = "5";
        break;
      case "Sábado":
        getNumberOfDay = "6";
        break;
    }

    return getNumberOfDay;
  }, []);

  const handleFiltersSubmit = useCallback(async () => {
    loadFavorites();

    const day = formatWeekDay(week_day);

    const response = await api.get("classes", {
      params: {
        subject,
        week_day: day,
        time,
      },
    });

    setAreFiltersVisible(false);
    setTeachers(response.data);
  }, [subject, week_day, time]);

  return (
    <View style={styles.container}>
      <PageHeader
        title="Proffys disponíveis"
        headerRight={
          <BorderlessButton onPress={handleToogleFiltersVisible}>
            <Feather name="filter" size={20} color="#fff" />
          </BorderlessButton>
        }
      >
        {areFiltersvisible && (
          <View style={styles.searchForm}>
            <Text style={styles.label}>Matéria</Text>
            <TextInput
              style={styles.input}
              placeholderTextColor="#c1bccc"
              placeholder="Química"
              value={subject}
              onChangeText={(text) => setSubject(text)}
            />

            <View style={styles.inputGroup}>
              <View style={styles.inputBlock}>
                <Text style={styles.label}>Dia da semana</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#c1bccc"
                  placeholder="Segunda-feira"
                  value={week_day}
                  onChangeText={(text) => setWeekDay(text)}
                />
              </View>

              <View style={styles.inputBlock}>
                <Text style={styles.label}>Horário</Text>
                <TextInput
                  style={styles.input}
                  placeholderTextColor="#c1bccc"
                  placeholder="9:00"
                  value={time}
                  onChangeText={(text) => setTime(text)}
                />
              </View>
            </View>

            <RectButton
              onPress={handleFiltersSubmit}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Filtrar</Text>
            </RectButton>
          </View>
        )}
      </PageHeader>

      <ScrollView
        style={styles.teacherList}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        {teachers.map((teacher: Teacher) => (
          <TeacherItem
            key={teacher.id}
            teacher={teacher}
            favorite={favorites.includes(teacher.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default TeacherList;
