class AdminService {
	static async getUsers() {
		const response = await fetch("/api/users");
		return response.json();
	}
}

export default AdminService;
