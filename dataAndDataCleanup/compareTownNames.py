def compare_files(file1, file2):
    # Read the contents of the first file
    with open(file1, 'r') as f1:
        names1 = set(line.strip() for line in f1 if line.strip())

    # Read the contents of the second file
    with open(file2, 'r') as f2:
        names2 = set(line.strip() for line in f2 if line.strip())

    # Calculate unique names
    unique_to_file1 = names1 - names2
    unique_to_file2 = names2 - names1

    # Display results
    print("Names only in", file1, ":")
    for name in sorted(unique_to_file1):
        print(name)

    print("\nNames only in", file2, ":")
    for name in sorted(unique_to_file2):
        print(name)


# Run the comparison
def main():
    file1 = 'names_output.txt'
    file2 = 'pln_area_names.txt'
    compare_files(file1, file2)


if __name__ == "__main__":
    main()
