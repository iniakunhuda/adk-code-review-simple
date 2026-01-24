// VULNERABLE API SERVER - For Code Review Testing
// This code contains MULTIPLE security vulnerabilities

package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq"
)

// 🚨 HARDCODED SECRETS
const (
	DBHost     = "production-db.example.com"
	DBPort     = 5432
	DBUser     = "postgres"
	DBPassword = "P@ssw0rd!2024Secure" // 🚨 HARDCODED PASSWORD
	DBName     = "production_db"
	APIKey     = "sk-live-51AbCdEf1234567890" // 🚨 HARDCODED API KEY
)

var db *sql.DB

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"` // 🚨 SENSITIVE DATA EXPOSURE
	Email    string `json:"email"`
	Role     string `json:"role"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// 🚨 SQL INJECTION VULNERABILITY
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	json.NewDecoder(r.Body).Decode(&req)

	// 🚨 SQL INJECTION - String concatenation
	query := fmt.Sprintf(
		"SELECT * FROM users WHERE username = '%s' AND password = '%s'",
		req.Username, req.Password,
	)

	rows, err := db.Query(query)
	if err != nil {
		// 🚨 INFORMATION LEAKAGE - Exposing database errors
		http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		rows.Scan(&user.ID, &user.Username, &user.Password, &user.Email, &user.Role)
		users = append(users, user)
	}

	// 🚨 SENSITIVE DATA EXPOSURE - Returning password in response
	json.NewEncoder(w).Encode(users)
}

// 🚨 COMMAND INJECTION VULNERABILITY
func PingHandler(w http.ResponseWriter, r *http.Request) {
	ip := r.URL.Query().Get("ip")

	// 🚨 COMMAND INJECTION - Direct command execution
	cmd := fmt.Sprintf("ping -c 4 %s", ip)
	output, err := exec.Command("sh", "-c", cmd).Output()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write(output)
}

// 🚨 PATH TRAVERSAL VULNERABILITY
func DownloadHandler(w http.ResponseWriter, r *http.Request) {
	filename := r.URL.Query().Get("file")

	// 🚨 PATH TRAVERSAL - No path validation
	filepath := "/var/www/files/" + filename

	http.ServeFile(w, r, filepath)
}

// 🚨 INSECURE DESERIALIZATION
func ConfigHandler(w http.ResponseWriter, r *http.Request) {
	config := r.URL.Query().Get("data")

	// 🚨 Untrusted deserialization
	var result map[string]interface{}
	json.Unmarshal([]byte(config), &result)

	// 🚨 SSRF - Making request to user-controlled URL
	url := result["url"].(string)
	resp, _ := http.Get(url)
	defer resp.Body.Close()

	json.NewEncoder(w).Encode(map[string]string{
		"status": "config loaded",
	})
}

// 🚨 WEAK AUTHENTICATION - No password hashing
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var user User
	json.NewDecoder(r.Body).Decode(&user)

	// 🚨 STORING PLAINTEXT PASSWORD
	query := fmt.Sprintf(
		"INSERT INTO users (username, password, email) VALUES ('%s', '%s', '%s')",
		user.Username, user.Password, user.Email,
	)

	_, err := db.Exec(query)
	if err != nil {
		// 🚨 SQL Error exposure
		http.Error(w, "Registration failed: "+err.Error(), http.StatusBadRequest)
		return
	}

	// 🚨 LOGGING SENSITIVE DATA
	log.Printf("New user registered: %s with password: %s", user.Username, user.Password)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

// 🚨 MISSING AUTHORIZATION
func AdminHandler(w http.ResponseWriter, r *http.Request) {
	// No authentication check!

	// 🚨 SENSITIVE DATA EXPOSURE
	query := "SELECT * FROM users WHERE role = 'admin'"
	rows, _ := db.Query(query)
	defer rows.Close()

	var admins []User
	for rows.Next() {
		var admin User
		rows.Scan(&admin.ID, &admin.Username, &admin.Password, &admin.Email, &admin.Role)
		admins = append(admins, admin)
	}

	json.NewEncoder(w).Encode(admins)
}

// 🚨 INSECURE RANDOM - Using math/rand for security
func GenerateToken() string {
	// 🚨 Weak random generation
	return fmt.Sprintf("token_%d", rand.Intn(1000000))
}

func main() {
	// 🚨 INSECURE TLS CONFIG
	connStr := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		DBHost, DBPort, DBUser, DBPassword, DBName,
	)

	var err error
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/login", LoginHandler)
	http.HandleFunc("/ping", PingHandler)
	http.HandleFunc("/download", DownloadHandler)
	http.HandleFunc("/config", ConfigHandler)
	http.HandleFunc("/register", RegisterHandler)
	http.HandleFunc("/admin", AdminHandler)

	// 🚨 Running on HTTP instead of HTTPS
	fmt.Println("Server starting on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
