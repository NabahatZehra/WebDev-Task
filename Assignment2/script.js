$(document).ready(function () {
  const apiUrl = "https://jsonplaceholder.typicode.com/posts";
  let posts = []; 

  function loadPosts() {
    $.get(apiUrl, function (data) {
      posts = data.slice(0, 10); 
      renderPosts();
    });
  }

  function renderPosts() {
    const rows = posts.map(
      (post) => `
        <tr>
          <td>${post.id}</td>
          <td>${post.title}</td>
          <td>${post.body}</td>
          <td>
            <button class="btn btn-warning btn-sm edit-btn" data-id="${post.id}">Edit</button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${post.id}">Delete</button>
          </td>
        </tr>`
    );
    $("#postsTable tbody").html(rows.join(""));
  }

  loadPosts();

  $("#postForm").submit(function (e) {
    e.preventDefault();

    const id = $("#postId").val();
    const title = $("#title").val();
    const body = $("#body").val();
    const postData = { title, body, userId: 1 };

    if (id) {
      // UPDATE - PUT request
      $.ajax({
        url: `${apiUrl}/${id}`,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify(postData),
        success: function (response) {
          const index = posts.findIndex((p) => p.id == id);
          if (index !== -1) {
            posts[index].title = title;
            posts[index].body = body;
            renderPosts();
            alert("Post updated successfully!");
          }
          console.log("PUT Response:", response);
        },
        error: function (error) {
          console.error("PUT Error:", error);
          alert("Error updating post");
        }
      });
    } else {
      // CREATE - POST request
      $.ajax({
        url: apiUrl,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(postData),
        success: function (response) {
          const newPost = {
            id: posts.length ? posts[posts.length - 1].id + 1 : 1,
            title,
            body,
            userId: 1,
          };
          posts.push(newPost);
          renderPosts();
          alert("Post added successfully!");
          console.log("POST Response:", response);
        },
        error: function (error) {
          console.error("POST Error:", error);
          alert("Error adding post");
        }
      });
    }

    $("#postForm")[0].reset();
    $("#postId").val("");
  });

  $(document).on("click", ".edit-btn", function () {
    const id = $(this).data("id");
    const post = posts.find((p) => p.id == id);
    if (post) {
      $("#postId").val(post.id);
      $("#title").val(post.title);
      $("#body").val(post.body);
    }
  });

  $(document).on("click", ".delete-btn", function () {
    const id = $(this).data("id");
    if (confirm("Are you sure you want to delete this post?")) {
      // DELETE request
      $.ajax({
        url: `${apiUrl}/${id}`,
        method: "DELETE",
        success: function (response) {
          posts = posts.filter((p) => p.id != id);
          renderPosts();
          alert("Post deleted successfully!");
          console.log("DELETE Response:", response);
        },
        error: function (error) {
          console.error("DELETE Error:", error);
          alert("Error deleting post");
        }
      });
    }
  });

  $("#cancelEdit").click(function () {
    $("#postId").val("");
    $("#postForm")[0].reset();
  });
});