// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    const searchBarToggle = document.getElementById('searchBarToggle');
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.getElementById('searchInput');

    // Toggle search bar visibility
    searchBarToggle.addEventListener('click', function() {
        if (searchBar.style.display === 'none' || searchBar.style.display === '') {
            searchBar.style.display = 'block';
        } else {
            searchBar.style.display = 'none';
        }
    });

    // Implement search functionality
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const posts = document.querySelectorAll('.post'); // Get all post elements

        posts.forEach(post => {
            const title = post.querySelector('.post-title').textContent.toLowerCase();
            const calories = post.querySelector('.post-calories').textContent.toLowerCase();
            const category = post.querySelector('.post-category').textContent.toLowerCase(); // Corrected selector

            // Check if the search term matches any part of the title, calories, or category
            if (title.includes(searchTerm) || calories.includes(searchTerm) || category.includes(searchTerm)) {
                post.style.display = 'block'; // Show matching post
            } else {
                post.style.display = 'none'; // Hide non-matching post
            }
        });
    });

    // Optional: Clear search input when the search bar is closed
    searchBarToggle.addEventListener('click', function() {
        if (searchBar.style.display === 'none') {
            searchInput.value = ''; // Clear the search input when closed
        }
    });
});
