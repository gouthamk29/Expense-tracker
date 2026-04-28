import API from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Expense = {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date?: string;
};

type DateFilter = "all" | "today" | "week" | "month";

const DATE_FILTERS: { label: string; value: DateFilter }[] = [
  { label: "All", value: "all" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return "No date";
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatDateDisplay(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function isWithinDateFilter(dateStr: string | undefined, filter: DateFilter): boolean {
  if (filter === "all") return true;
  if (!dateStr) return false;

  const date = new Date(dateStr);
  const now = new Date();

  if (filter === "today") {
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }
  if (filter === "week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
  }
  if (filter === "month") {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }
  return true;
}

export default function Dashboard() {
  const router = useRouter();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/expenses/");
      setExpenses(res.data);
    } catch {
      Alert.alert("Error", "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await API.get("/expenses/");
        if (isMounted) setExpenses(res.data);
      } catch {
        if (isMounted) Alert.alert("Error", "Failed to load expenses");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredExpenses = expenses.filter((e) => {
    const matchesCategory = e.category
      ?.toLowerCase()
      .includes(categoryFilter.toLowerCase());
    const matchesDate = isWithinDateFilter(e.date, dateFilter);
    return matchesCategory && matchesDate;
  });

  const addExpense = async () => {
    if (!title || !amount) {
      Alert.alert("Error", "Fill all fields");
      return;
    }
    try {
      await API.post("/expenses", {
        title,
        amount: Number(amount),
        category,
        date: date.toISOString(),
      });
      setTitle("");
      setAmount("");
      setCategory("");
      setDate(new Date());
      setShowPicker(false);
      setModalVisible(false);
      fetchExpenses();
    } catch {
      Alert.alert("Error", "Failed to add");
    }
  };

  const deleteExpense = async (id: string) => {
    await API.delete(`/expenses/${id}`);
    fetchExpenses();
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/(auth)/login");
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const isFiltered = categoryFilter.length > 0 || dateFilter !== "all";

  return (
    <View style={styles.container}>
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading expenses...</Text>
        </View>
      )}

     
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutBtn}>Logout</Text>
        </TouchableOpacity>
      </View>

      
      <TextInput
        placeholder="Filter by category (e.g. food)"
        value={categoryFilter}
        onChangeText={setCategoryFilter}
        style={styles.filterInput}
      />
      {categoryFilter.length > 0 && (
        <TouchableOpacity onPress={() => setCategoryFilter("")}>
          <Text style={styles.clearFilter}>Clear Category Filter</Text>
        </TouchableOpacity>
      )}

      
      <View style={styles.dateFilterRow}>
        {DATE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.pill, dateFilter === f.value && styles.pillActive]}
            onPress={() => setDateFilter(f.value)}
          >
            <Text
              style={[
                styles.pillText,
                dateFilter === f.value && styles.pillTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No expenses found.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardAmount}>₹{item.amount}</Text>
              <View style={styles.cardMeta}>
                {item.category ? (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                  </View>
                ) : null}
                <Text style={styles.dateLabel}>📅 {formatDate(item.date)}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => deleteExpense(item._id)}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

     
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Expense</Text>

            <TextInput
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Category"
              value={category}
              onChangeText={setCategory}
              style={styles.input}
            />

            
            <Text style={styles.inputLabel}>Date</Text>
            <TouchableOpacity
              style={styles.datePickerBtn}
              onPress={() => setShowPicker(true)}
            >
              <Text style={styles.datePickerText}>
                📅 {formatDateDisplay(date)}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                maximumDate={new Date()}
                onChange={(_, selected) => {
                  setShowPicker(Platform.OS === "ios");
                  if (selected) setDate(selected);
                }}
              />
            )}

            <TouchableOpacity style={styles.addBtn} onPress={addExpense}>
              <Text style={{ color: "#fff" }}>Add</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      
      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>
          {isFiltered ? "Filtered Total" : "Total"}: ₹
          {isFiltered ? filteredTotal : total}
          {isFiltered && (
            <Text style={styles.bottomCount}>
              {" "}
              ({filteredExpenses.length} items)
            </Text>
          )}
        </Text>
      </View>
    </View>
  );
}

const BOTTOM_BAR_HEIGHT = 56;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ffffffcc",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingText: { marginTop: 10, fontSize: 14, color: "#555" },
  header: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: "bold" },
  logoutBtn: {
    color: "white",
    backgroundColor: "red",
    paddingHorizontal: 6,
    borderRadius: 8,
    paddingVertical: 2,
    fontSize: 24,
    fontWeight: "bold",
  },
  filterInput: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  clearFilter: { color: "blue", marginBottom: 6 },
  dateFilterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#007bff",
  },
  pillActive: { backgroundColor: "#007bff" },
  pillText: { color: "#007bff", fontSize: 13 },
  pillTextActive: { color: "#fff" },
  listContent: { paddingBottom: BOTTOM_BAR_HEIGHT + 80 },
  card: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "500", marginBottom: 2 },
  cardAmount: { fontSize: 15, color: "#333", marginBottom: 4 },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  categoryBadge: {
    backgroundColor: "#e8f0fe",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryBadgeText: { color: "#3a5adb", fontSize: 12 },
  dateLabel: { fontSize: 12, color: "#666" },
  deleteBtn: { paddingLeft: 10 },
  deleteBtnText: { color: "red" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40 },
  fab: {
    position: "absolute",
    bottom: BOTTOM_BAR_HEIGHT + 16,
    right: 20,
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 999,
  },
  fabText: { color: "#fff", fontSize: 30 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000088",
  },
  modal: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 6 },
  inputLabel: { fontSize: 13, color: "#555", marginBottom: 4 },
  datePickerBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  datePickerText: { fontSize: 15, color: "#333" },
  addBtn: {
    backgroundColor: "#28a745",
    padding: 10,
    alignItems: "center",
    borderRadius: 6,
  },
  cancelText: { marginTop: 10, textAlign: "center", color: "#555" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    height: BOTTOM_BAR_HEIGHT,
  },
  bottomText: { fontSize: 16, fontWeight: "bold" },
  bottomCount: { fontSize: 13, fontWeight: "normal", color: "#555" },
});