document.addEventListener("DOMContentLoaded", function() {

    // Toggle search bar visibility
    searchBarToggle.addEventListener('click', function() {
        if (searchBar.style.display === 'none' || searchBar.style.display === '') {
            searchBar.style.display = 'block';
        } else {
            searchBar.style.display = 'none';
        }
    });
    
    // Function to filter flagged users based on search input
    function filterUsers() {
      // Get the search input value and convert it to lowercase for case-insensitive matching
      const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  
      // Get all the notification items (user elements)
      const notificationItems = document.querySelectorAll('.notification-item');
  
      // Loop through all notification items and check if they match the search query
      notificationItems.forEach(item => {
        const username = item.getAttribute('data-username').toLowerCase();
        const flagReason = item.getAttribute('data-flag-reason').toLowerCase();
  
        // If either the username or flag reason matches the search query, show the item
        if (username.includes(searchQuery) || flagReason.includes(searchQuery)) {
          item.style.display = 'block'; // Show the item
        } else {
          item.style.display = 'none'; // Hide the item
        }
      });
    }
  
    // Attach the filterUsers function to the search input on keyup event
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keyup', filterUsers);
  });
  