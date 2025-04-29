<!DOCTYPE html>
<html>
<head>
    <title>Test Upload Image</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        form {
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 5px;
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <h1>Test Upload Image</h1>
    
    <form method="POST" action="/test-upload" enctype="multipart/form-data">
        @csrf
        <div>
            <label for="image">Sélectionner une image:</label>
            <input type="file" name="image" id="image" accept="image/*">
        </div>
        <br>
        <button type="submit">Uploader</button>
    </form>

    <div style="margin-top: 20px;">
        <h2>Images dans le dossier</h2>
        <ul>
            @php
                $files = glob(storage_path('app/public/images/cocktails/*'));
                foreach($files as $file) {
                    $filename = basename($file);
                    echo "<li>$filename - <a href='/storage/images/cocktails/$filename' target='_blank'>Voir</a></li>";
                }
            @endphp
        </ul>
    </div>
</body>
</html> 